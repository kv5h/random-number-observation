FROM public.ecr.aws/lambda/python:3.13

WORKDIR /var/task
COPY requirements.txt .
RUN pip install -r requirements.txt --no-cache-dir

COPY function.py .
CMD [ "function.lambda_handler" ]
