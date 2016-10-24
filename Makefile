all: production


production:
	npm install
	./node_modules/.bin/webpack --production --progress --colors


development:
	./node_modules/.bin/webpack-dev-server --progress --colors --hot --inline --watch


.PHONY: all production develop
