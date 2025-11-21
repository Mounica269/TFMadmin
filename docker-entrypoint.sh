#!/bin/sh

echo "Injecting environment variables..."

# Replace placeholders with actual environment variables in JS files
for file in /usr/share/nginx/html/static/js/*.js; do
  sed -i "s|__REACT_APP_API_URL__|${REACT_APP_API_URL}|g" "$file"
  sed -i "s|__REACT_APP_IMAGE_PATH__|${REACT_APP_IMAGE_PATH}|g" "$file"
  sed -i "s|__REACT_APP_MAINTENANCE_MODE__|${REACT_APP_MAINTENANCE_MODE}|g" "$file"
done

echo "Environment variables injected successfully"
echo "REACT_APP_API_URL=${REACT_APP_API_URL}"

# Start nginx
exec nginx -g 'daemon off;'
