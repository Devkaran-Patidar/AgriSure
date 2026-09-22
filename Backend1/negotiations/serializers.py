from rest_framework import serializers
from .models import NegotiationOffer

class NegotiationOfferSerializer(serializers.ModelSerializer):
    offered_by_name = serializers.CharField(source='offered_by.username', read_only=True)

    class Meta:
        model = NegotiationOffer
        fields = '__all__'
        read_only_fields = ['offered_by', 'status']

    def create(self, validated_data):
        validated_data['offered_by'] = self.context['request'].user
        contract = validated_data['contract']
        
        # Ensure user is part of the contract
        user = self.context['request'].user
        if user.role == 'FARMER' and contract.farmer != user.farmer_profile:
            raise serializers.ValidationError("You are not part of this contract.")
        if user.role == 'COMPANY' and contract.company != user.company_profile:
            raise serializers.ValidationError("You are not part of this contract.")

        # Update contract status
        contract.status = 'NEGOTIATING'
        contract.save()

        return super().create(validated_data)
