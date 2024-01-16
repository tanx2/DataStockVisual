from django.db import models

'''
    Django model representing stock data.

    JSON dummy object structure:
    {
        "date": "2020-08-10",
        "trade_code": "1JANATAMF",
        "high": "4.3",
        "low": "4.1",
        "open": "4.2",
        "close": "4.1",
        "volume": "2,285,416"
    }

    Model Fields:
    - trade_code: CharField with a maximum length of 50 characters.
    - date: DateField for the trading date.
    - open: DecimalField with max_digits=10 and decimal_places=2 for opening price.
    - high: DecimalField with max_digits=10 and decimal_places=2 for highest price.
    - low: DecimalField with max_digits=10 and decimal_places=2 for lowest price.
    - close: DecimalField with max_digits=10 and decimal_places=2 for closing price.
    - volume: IntegerField for trading volume (assuming it is an integer).

'''

class StockData(models.Model):
    trade_code = models.CharField(max_length=50)
    date = models.DateField()
    open = models.DecimalField(max_digits=10, decimal_places=2)
    high = models.DecimalField(max_digits=10, decimal_places=2)
    low = models.DecimalField(max_digits=10, decimal_places=2)
    close = models.DecimalField(max_digits=10, decimal_places=2)
    volume = models.IntegerField()
