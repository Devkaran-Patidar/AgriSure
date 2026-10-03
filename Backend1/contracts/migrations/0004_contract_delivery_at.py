from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("contracts", "0003_contract_company_approved_at_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="contract",
            name="delivery_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
