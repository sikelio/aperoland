## Config
### ENV
```env
# SERVER
URL=
NODE_ENV=

# EXPRESS
EXPRESS_PORT=
EXPRESS_SECRET=

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

# TOMTOM
TOMTOM_API_KEY=

# SPOTIFY
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
```

### NGINX CONF
```conf
server {
	listen 80;
	server_name subdomain.domain.extension;

	access_log /var/log/nginx/subdomain.domain.extension.access
	error_log /var/log/nginx/subdomain.domain.extension.error

	location / {
		proxy_pass						http://server-ip:port/;
		proxy_set_header				X-Forwarded-Host		$server_name:$server_port;
		proxy_hide_header				Referer;
		proxy_hide_header				Origin;
		proxy_set_header				Referer					'';
		proxy_set_header				Origin					'';
		proxy_set_header				X-Real-IP				$remote_addr;
		proxy_set_header				X-Forwarded-For			$remote_addr;

		proxy_headers_hash_max_size		1024;
		proxy_headers_hash_bucket_size	256;

		proxy_set_header				X-Forwarded-For			$proxy_add_x_forwarded_for;
		proxy_set_header				Host					$host;

		proxy_http_version				1.1;
		proxy_set_header				Upgrade					$http_upgrade;
		proxy_set_header				Connection				"upgrade";

		add_header						X-Frame-Options			"SAMEORIGIN";
	}
}
```

## TODO
 - [X] Auth System
 - BackOffice
    - [] Number of connections
    - [X] IP address of connections
 - Various
    - [X] Dark & Light mode
    - [X] Innovative functionality
    - [X] Random quotes on home page from database
 - [X] Legal notice page
 - [X] Cookie management system
 - [X] Usage of an public API