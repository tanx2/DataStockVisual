from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader, TemplateDoesNotExist
from django.db.utils import IntegrityError

import json
from datetime import datetime
from .models import StockData

def error_handler(Message, request):
    """
    Custom error handler to render when error occurs template with a given message.

    Parameters:
    - message (str): The error message to be displayed.
    - request (HttpRequest): The current request object.

    Returns:
    - HttpResponse: Rendered response with the error message.
    """
    context = {
        "message": Message
    }
    template = loader.get_template('404.html')
    return HttpResponse(template.render(context, request))


def load_stock_data(request):
    """
    View function to load stock data into the StockData model and render the - 'stock_data_dashboard.html' template.

    Parameters:
    - request (HttpRequest): The current request object.

    Returns:
    - HttpResponse: Rendered response with the stock data on success, or calls error_handler(Message, request):
    on failure.
    """
    # If data already exists loads it from model
    if StockData.objects.exists():
        stock_data = StockData.objects.all()
        print('Current total records:', stock_data.count())
        
    else:
        # If data does not already exist then load from json file
        try:
            with open('app/data/stock_market_data.json', 'r') as file:
                data = json.load(file)
        except FileNotFoundError:
            # Handle file not found
            return error_handler('The file has been probably removed/moved.', request)
        
        except json.JSONDecodeError:
            # Handle JSON decoding error
            return error_handler('Server module is not available at this moment.', request)
        
        for item in data:
            try:
                try:
                    StockData.objects.create(
                        trade_code=item['trade_code'],
                        date=datetime.strptime(item['date'], '%Y-%m-%d').date(),
                        open=float(item['open']),
                        high=float(item['high']),
                        low=float(item['low']),
                        close=float(item['close']),
                        volume=int(item['volume'].replace(',', ''))
                    )
                except IntegrityError:
                    # Handle integrity error (e.g., duplicate record)
                    print('')
            except KeyError:
                # Handle missing key in the JSON data
                print('We are currently addressing a technical issue and regret to inform you that data display is temporarily unavailable; our team is working diligently to resolve this matter promptly.')
            except ValueError:
                # Handle data conversion error
               return error_handler("Server-side error. Contact ", request)
                    
    template = loader.get_template('stock_data_dashboard.html')
    try:
        template = loader.get_template('stock_data_dashboard.html')
        # Raise TemplateDoesNotExist exception with an empty template name ('').
        # If everything is functioning correctly, send data to the template and display it.
        return HttpResponse(template.render({'stock_data': stock_data}, request))
    except TemplateDoesNotExist:
        # Handle data TemplateDoesNotExist error
        return error_handler("Please check the path.", request)

