from django.urls import path
from . import views
from .views import EmailTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [

    # -------------------------
    # General
    # -------------------------
    path("hello/", views.hello, name="hello"),


    # -------------------------
    # Stock Data (External APIs)
    # -------------------------
    path("stockInfo/<str:ticker>/", views.get_stock_info, name="stock_info"),
    path("devstockInfo/<str:ticker>/", views.dev_get_stock_info, name="dev_stock_info"),

    path("aiResponse/<str:ticker>/", views.get_ai_response, name="ai_response"),

    path("stockSearch/", views.search_stock, name="stock_search"),
    path("devstockSearch/", views.dev_stock_search, name="dev_stock_search"),


    # -------------------------
    # Stock CRUD (Database)
    # -------------------------
    path("stocks/", views.list_stocks_view, name="list_stocks"),
    path("stocks/create/", views.create_stock_view, name="create_stock"),
    path("stocks/<str:symbol>/", views.get_stock_view, name="get_stock"),
    path("stocks/<str:symbol>/update/", views.update_stock_view, name="update_stock"),
    path("stocks/<str:symbol>/delete/", views.delete_stock_view, name="delete_stock"),

    path("stocks/search/", views.search_stock, name="search_stock_db"),


    # -------------------------
    # User Auth
    # -------------------------
    path("users/register/", views.register_user, name="register_user"),
    path("users/login/", EmailTokenObtainPairView.as_view(), name="login_user"),
    path("users/refresh/", TokenRefreshView.as_view(), name="token_refresh"),


    # -------------------------
    # User CRUD
    # -------------------------
    path("users/<uuid:user_id>/", views.get_user, name="get_user"),
    path("users/<uuid:user_id>/update/", views.update_user, name="update_user"),
    path("users/<uuid:user_id>/delete/", views.delete_user, name="delete_user"),
]