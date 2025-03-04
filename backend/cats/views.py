import stripe

from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets

from .serializers import OrderSerializer
from .models import Order, Item, OrderItem
from .serializers import ItemSerializer

stripe.api_key = settings.STRIPE_SECRET_KEY


class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    pagination_class = PageNumberPagination
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='add')
    def add(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    @method_decorator(never_cache, name="dispatch")
    @action(detail=True, methods=["get"])
    def buy(self, request, pk=None):
        item = self.get_object()

        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "usd",
                    "product_data": {"name": item.name},
                    "unit_amount": int(item.price * 100),
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=f"{settings.SITE_URL}/success",
            cancel_url=f"{settings.SITE_URL}/cancel",
        )

        response = Response({"session_id": session.id})
        response["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response["Pragma"] = "no-cache"
        response["Expires"] = "0"
        return response    


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]  

    @action(detail=False, methods=['post'], url_path='add_item_to_order')
    def add_item_to_order(self, request):
        user = request.user
        order, created = Order.objects.get_or_create(user=user)

        item_id = request.data.get('item_id')
        quantity = request.data.get('quantity', 1)

        try:
            item = Item.objects.get(id=item_id)
        except Item.DoesNotExist:
            return Response({"detail": "Item not found."}, 
                            status=status.HTTP_404_NOT_FOUND)

        order_item, created = OrderItem.objects.get_or_create(
            order=order,
            item=item,
            defaults={'quantity': quantity}
        )

        if not created:
            order_item.quantity += quantity
            order_item.save()

        return Response({
            "detail": f"Item {item.name}" 
            f"{'added to' if created else 'updated in'} your order."
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='current')
    def get_current_order(self, request):
        """Получить текущую корзину пользователя"""
        order, _ = Order.objects.get_or_create(user=request.user)
        serializer = OrderSerializer(order)  # Теперь в ответе будут товары
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=["post"])
    def remove_item(self, request, pk=None):
        """
        Удаляет товар из заказа.
        URL: /api/orders/{order_id}/remove_item/
        """
        order = self.get_object()  # Получаем заказ по pk
        item_id = request.data.get("item_id")

        if not item_id:
            return Response({"error": "item_id is required"},
                             status=status.HTTP_400_BAD_REQUEST)

        try:
            order_item = OrderItem.objects.get(order=order, id=item_id)
            order_item.delete()
            return Response({"status": "Item removed successfully"},
                             status=status.HTTP_200_OK)
        except OrderItem.DoesNotExist:
            return Response({"error": "Item not found in the order"}, 
                            status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=["post"])
    def create_checkout_session(self, request, pk=None):
        order = self.get_object()
        items = order.orders_items.all()

        total_price = sum(item.item.price * item.quantity for item in items)
    
        discount_percentage = 0
        for discount in order.discounts.all():
            discount_cur = 0
            discount_cur += (total_price // discount.sum) * discount.percentage
            discount_percentage = max(discount_cur, discount_percentage)
    
        if discount_percentage > 30:
            discount_percentage = 30

        line_items = [
            {
                "price_data": {
                    "currency": "rub",
                    "product_data": {"name": order_item.item.name},
                    "unit_amount": order_item.item.price * 100,
                },
                "quantity": order_item.quantity,
            }
            for order_item in items
        ]

        discounts = []
        for discount in order.discounts.all():
            stripe_discount = stripe.Coupon.create(
                percent_off=discount_percentage,
                duration="once"
            )
            discounts.append({"coupon": stripe_discount.id})

        tax_rates = []
        for tax in order.taxes.all():
            stripe_tax = stripe.TaxRate.create(
                display_name=tax.name,
                percentage=tax.percentage,
                inclusive=False  
            )
            tax_rates.append(stripe_tax.id)

        for item in line_items:
            item["tax_rates"] = tax_rates

        try:
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=line_items,
                mode="payment",
                success_url=f"http://localhost:9000/success?order_id={order.id}",
                cancel_url="http://localhost:9000/cancel",
                discounts=discounts,
            )

            return Response({"url": session.url}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    @action(detail=True, methods=["post"])
    def update_order_items(self, request, pk=None):
        order = self.get_object()
        items_data = request.data.get("items", [])

        for item_data in items_data:
            try:
                order_item = order.orders_items.get(id=item_data["id"])
                order_item.quantity = item_data["quantity"]
                order_item.save()
            except OrderItem.DoesNotExist:
                return Response({"error": f"Товар {item_data['id']} не найден"},
                                 status=status.HTTP_400_BAD_REQUEST)
        return Response({"status": "Обновлено"}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=["post"])
    def clear_order(self, request, pk=None):
        order = self.get_object()
        order.orders_items.all().delete()
        return Response({"status": "Order cleared"}, status=status.HTTP_200_OK)
    

@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        return JsonResponse({"error": "Invalid payload"}, status=400)
    except stripe.error.SignatureVerificationError as e:
        return JsonResponse({"error": "Invalid signature"}, status=400)

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        order_id = session.get("metadata", {}).get("order_id")

        if order_id:
            try:
                order = Order.objects.get(id=order_id)
                order.orders_items.all().delete()  # Удаляем все товары
            except Order.DoesNotExist:
                return JsonResponse({"error": "Order not found"}, status=404)

    return JsonResponse({"status": "success"}, status=200)
