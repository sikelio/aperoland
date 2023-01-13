## Config
### ENV
```env
# SERVER
URL=
NODE_ENV=

# EXPRESS
EXPRESS_PORT=

# MYSQL
MYSQL_USER=
MYSQL_PASSWORD=
MYSQL_HOST=
MYSQL_DATABASE=

# JWT
JWT_SECRET=
JWT_EXPIRES_IN=
JWT_COOKIE_EXPIRES=
JWT_RESET_EXPIRES_IN=

# NODEMAILER
NODEMAILER_USER=
NODEMAILER_PASSWORD=
NODEMAILER_HOST=
NODEMAILER_PORT=
```

### NGINX CONF
```conf
server {
	listen 80;
	server_name subdomain.domain.extension;

	access_log /var/log/nginx/subdomain.domain.extension.access
	error_log /var/log/nginx/subdomain.domain.extension.error

	location / {
		proxy_pass              http://server-ip:port/;
      	proxy_set_header        X-Forwarded-Host        $server_name:$server_port;
      	proxy_hide_header       Referer;
      	proxy_hide_header       Origin;
      	proxy_set_header        Referer                 '';
      	proxy_set_header        Origin                  '';
      	proxy_set_header        X-Real-IP               $remote_addr;
      	proxy_set_header        X-Forwarded-For         $remote_addr;
      	add_header              X-Frame-Options         "SAMEORIGIN";
	}
}
```

## TODO
 - [X] Auth System
 - BackOffice
    - [] Number of connections
    - [X] IP address of connections
 - Various
    - [] Dark & Light mode
    - [] Innovative functionality
    - [X] Random quotes on home page from database
 - [] Legal notice page
 - [X] Cookie management system
 - [X] Usage of an public API