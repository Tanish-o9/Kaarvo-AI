from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from artisan_api.views import AssistantChatView, TranslateTextView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/chat', AssistantChatView.as_view(), name='api-chat-direct'),
    path('api/chat/', AssistantChatView.as_view(), name='api-chat-slash'),
    path('api/v1/chat', AssistantChatView.as_view(), name='api-v1-chat-direct'),
    path('api/v1/chat/', AssistantChatView.as_view(), name='api-v1-chat-slash'),
    path('api/translate', TranslateTextView.as_view(), name='api-translate-direct'),
    path('api/translate/', TranslateTextView.as_view(), name='api-translate-slash'),
    path('api/v1/translate', TranslateTextView.as_view(), name='api-v1-translate-direct'),
    path('api/v1/translate/', TranslateTextView.as_view(), name='api-v1-translate-slash'),
    path('api/v1/', include('artisan_api.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
