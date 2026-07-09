# --- Etapa 1: Compilación (Build) ---
FROM node:20-alpine AS build
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias del proyecto
RUN npm install

# Copiar el código fuente del proyecto
COPY . .

# Compilar la aplicación para producción
RUN npm run build

# --- Etapa 2: Servidor Web (Nginx) ---
FROM nginx:alpine

# Eliminar los archivos por defecto de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar los archivos compilados del build de Angular
# El output del build de Angular 18 se ubica en dist/juegos-de-mesa-angular/browser
COPY --from=build /app/dist/juegos-de-mesa-angular/browser /usr/share/nginx/html

# Copiar la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80 del contenedor
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
