from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from django.views.static import serve

from . import views

urlpatterns = [
    # Endpoint to load stock data from JSON
    path('', views.load_stock_data, name='Load Stock data/json'),
]
