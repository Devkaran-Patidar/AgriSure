from django.db import migrations, models


def backfill_delivery_dates(apps, schema_editor):
    Contract = apps.get_model("contracts", "Contract")
    Contract.objects.filter(status="COMPLETED", delivery_at__isnull=True).update(delivery_at=models.F("updated_at"))


class Migration(migrations.Migration):
    dependencies = [
        ("contracts", "0004_contract_delivery_at"),
    ]

    operations = [
        migrations.RunPython(backfill_delivery_dates, migrations.RunPython.noop),
    ]
