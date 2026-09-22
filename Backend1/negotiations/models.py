from django.db import models
from contracts.models import Contract
from Accounts.models import User

class NegotiationOffer(models.Model):
    contract = models.ForeignKey(Contract, on_delete=models.CASCADE, related_name="negotiation_offers")
    offered_by = models.ForeignKey(User, on_delete=models.CASCADE)
    offered_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, default='PENDING', choices=[
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('REJECTED', 'Rejected')
    ])
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Offer {self.offered_price} on {self.contract}"
