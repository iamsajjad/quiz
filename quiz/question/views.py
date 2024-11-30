
from django.http import HttpResponseRedirect
from django.shortcuts import render

# Create your views here.

def q(request):

    return render(request, 'question/question.html')

def p(request):

    return render(request, 'question/passages.html')
