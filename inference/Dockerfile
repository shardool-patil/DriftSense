# Use a lightweight Python environment
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file first to leverage Docker cache
COPY requirements.txt .

# Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your Python code into the container
COPY . .

# Expose port 8000 for the FastAPI server
EXPOSE 8000

# Command to boot the Python AI engine
# (We use 0.0.0.0 so Spring Boot can reach it across the Docker network)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]