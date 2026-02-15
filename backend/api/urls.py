from django.urls import path
from . import views

urlpatterns = [
    path('hello/', views.hello, name='hello'),
    path('stockInfo/<str:ticker>', views.get_stock_info, name='stock_info'),
    path('aiResponse/<str:ticker>', views.get_ai_response, name='ai_response'),
    path('devstockInfo/<str:ticker>', views.dev_get_stock_info, name='dev_stock_info'),
    path('stockSearch/', views.search_stock, name='stockSearch'),
    path('devstockSearch/', views.dev_stock_search, name='dev_stockSearch'),

    path("users/register/", views.register_user, name="register_user"),
    path("users/<uuid:user_id>/", views.get_user, name="get_user"),
    path("users/<uuid:user_id>/update/", views.update_user, name="update_user"),
    path("users/<uuid:user_id>/delete/", views.delete_user, name="delete_user"),

    path("stocks/", views.list_stocks_view, name="list_stocks"),
    path("stocks/create/", views.create_stock_view, name="create_stock"),
    path("stocks/<str:symbol>", views.get_stock_view, name="get_stock"),
    path("stocks/<str:symbol>/update/", views.update_stock_view),
    path("stocks/<str:symbol>/delete/", views.delete_stock_view),

    path("stocks/search/", views.search_stock, name="search_stock"),
]
