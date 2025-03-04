from rest_framework import serializers
from rest_framework import serializers

from .models import Item, Order, OrderItem

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ['id', 'name', 'description', 'price']

class OrderItemSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)
    item_price = serializers.IntegerField(source='item.price', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'item_name', 'item_price', 'quantity']  # Отправляем в ответе нужные данные

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(source='orders_items', many=True)  # Используем related_name

    class Meta:
        model = Order
        fields = ['id', 'user', 'items']