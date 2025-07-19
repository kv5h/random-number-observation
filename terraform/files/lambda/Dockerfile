FROM public.ecr.aws/lambda/python:3.13

WORKDIR /var/task
COPY requirements.txt .
RUN pip install -r requirements.txt --target . \
    --platform manylinux2014_x86_64 \
    --only-binary :all: \
    --upgrade

COPY function.py .
CMD [ "function.lambda_handler" ]
