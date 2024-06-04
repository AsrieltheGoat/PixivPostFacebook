FROM nikolaik/python-nodejs:python3.9-nodejs20-slim
WORKDIR /app
COPY . /app
RUN pip install --no-cache-dir --upgrade -r requirements.txt 
RUN npm install 
CMD [ "python", "/app/cron.py" ]
