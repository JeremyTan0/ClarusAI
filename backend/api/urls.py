from django.urls import path
from . import views

urlpatterns = [
    path('hello/', views.hello, name='hello'),
    path('stockInfo/<str:ticker>', views.get_stock_info, name='stock_info' )
    path('aiResponse/<str:ticker>', views.get_ai_response, name='ai_response' )
]
