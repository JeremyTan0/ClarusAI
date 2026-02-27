from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from .managers import UserManager
import uuid


class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    def __str__(self):
        return self.email



class Stock(models.Model):
    symbol = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    exchange = models.CharField(max_length=50)
    country = models.CharField(max_length=50)
    sector = models.CharField(max_length=100, blank=True)
    industry = models.CharField(max_length=100, blank=True)
    website = models.URLField(blank=True)
    beta = models.FloatField(null=True)

    def __str__(self):
        return self.symbol