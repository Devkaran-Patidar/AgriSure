from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("communications", "0001_initial"),
        ("contracts", "0004_contract_delivery_at"),
    ]

    operations = [
        migrations.AddField(
            model_name="message",
            name="contract",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="messages",
                to="contracts.contract",
            ),
        ),
    ]
