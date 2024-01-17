from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader, TemplateDoesNotExist
from django.db.utils import IntegrityError
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt


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
        i = 0
        for item in data:
            print(i)
            i = i + 1
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
               return error_handler("Server-side error. You can contact us through phone number or email address given below.", request)
                    
    template = loader.get_template('stock_data_dashboard.html')
    try:
        template = loader.get_template('stock_data_dashboard.html')
        # Raise TemplateDoesNotExist exception with an empty template name ('').
        # If everything is functioning correctly, send data to the template and display it.
        return HttpResponse(template.render({'stock_data': stock_data}, request))
    except TemplateDoesNotExist:
        # Handle data TemplateDoesNotExist error
        return error_handler("Please check the path.", request)

@csrf_exempt
def update_model(request):
    if request.method == 'POST':
        data = request.POST.get('data')
        data_dict = json.loads(data)

        # Extract relevant information from the data object
        record_id = data_dict.get('id')
        trade_code = data_dict.get('trade_code')
        date_str = data_dict.get('date')
        date = datetime.strptime(date_str, '%b. %d, %Y').strftime('%Y-%m-%d')
        open_value = float(data_dict.get('open'))
        high_value = float(data_dict.get('high'))
        low_value = float(data_dict.get('low'))
        close_value = float(data_dict.get('close'))
        volume_value = int(data_dict.get('volume').replace(',', ''))

        try:
            # Get the record from the database
            record = StockData.objects.get(id=record_id)

            # Update the record with the new values
            record.trade_code = trade_code
            record.date = date
            record.open = open_value
            record.high = high_value
            record.low = low_value
            record.close = close_value
            record.volume = volume_value

            # Save the changes
            record.save()

            return JsonResponse({'status': 'success', 'message': 'Record updated successfully'})

        except StockData.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Record not found'})

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

@csrf_exempt
def delete_model(request):
    print('-------------before-------------------')
    if request.method == 'POST':
        
        
        id = request.POST.get('id')
        
        print('-----------------after---------------', id)
        try:
            # Assuming your model is named StockData
            stock_data = StockData.objects.get(id=id)
            stock_data.delete()

            return JsonResponse({'message': 'Model deleted successfully'})
        except StockData.DoesNotExist:
            return JsonResponse({'error': 'Model not found'}, status=404)

    return JsonResponse({'message': 'Model deleted successfully'})
# JsonResponse({'error': 'Invalid request'}, status=400)