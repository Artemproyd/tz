from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()

class Discount(models.Model):
    name = models.CharField(max_length=100)
    sum = models.FloatField(help_text="Сумма за которую даётся скидка")
    percentage = models.FloatField(help_text="Процент скидки (например, 10 для 10%)")

    def __str__(self):
        return f"{self.name} - {self.percentage}%"


class Tax(models.Model):
    name = models.CharField(max_length=100)
    percentage = models.FloatField(help_text="Процент налога (например, 20 для 20%)")

    def __str__(self):
        return f"{self.name} - {self.percentage}%"

class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    discounts = models.ManyToManyField(Discount, blank=True)
    taxes = models.ManyToManyField(Tax, blank=True)

    def get_total_price(self):
        """Рассчитывает итоговую цену с учетом скидок и налогов."""
        total = sum(item.item.price * item.quantity for item in self.orders_items.all())

        # Автоматически добавляем налог НДС (если не добавлен)
        vat, _ = Tax.objects.get_or_create(name="НДС", defaults={"percentage": 20})
        if not self.taxes.filter(id=vat.id).exists():
            self.taxes.add(vat)

        # Рассчитываем скидку (5% за каждые 500 рублей, но не более 30%)
        discount_percentage = min((total // 500) * 5, 30)
        discount, _ = Discount.objects.get_or_create(name="Авто-скидка", defaults={"percentage": discount_percentage})
        self.discounts.set([discount])  # Обновляем скидку в заказе

        # Применяем скидку
        total -= total * (discount.percentage / 100)

        # Применяем налоги
        total += total * (vat.percentage / 100)

        return round(total, 2)

class Item(models.Model):
    CURRENCY_CHOICES = [("rub", "RUB"), ("usd", "USD")]

    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.IntegerField()  # Цена всегда в базовой валюте (RUB)
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default="rub")

    def __str__(self):
        return self.name

class OrderItem(models.Model):
    order = models.ForeignKey(Order,
                              related_name='orders_items', 
                              on_delete=models.CASCADE)
    item = models.ForeignKey(Item, 
                             related_name='orders_items',
                             on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.item.name} ({self.quantity})"


