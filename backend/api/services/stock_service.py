from django.core.exceptions import ObjectDoesNotExist
from api.models import Stock
from api.serializers import StockSerializer

# CREATE
def create_stock(**data) -> Stock:
    serializer = StockSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    return serializer.save()


# READ
def get_stock_by_symbol(symbol: str) -> Stock:
    try:
        return Stock.objects.get(symbol=symbol.upper())
    except Stock.DoesNotExist:
        raise ObjectDoesNotExist("Stock not found")
    
def list_stocks(): 
    return Stock.objects.all()

# UPDATE
def update_stock(stock: Stock, **data) -> Stock:
    serializer = StockSerializer(
        stock,
        data=data,
        partial=True
    )
    serializer.is_valid(raise_exception=True)
    return serializer.save()


# DELETE
def delete_stock(stock: Stock) -> None:
    stock.delete()
