#### Aviso

Para subir a Plataforma-For por completo  utilize o docker-compose na raiz do projeto.

#### Construindo somente a imagem Docker do frontend 
Para construir o projeto com o Docker, se faz necessário ter no mínimo a versão 18.06 ou superior. 
A partir dessa versão é permitido a construição em modo multstage.

Execute os seguintes comandos na pasta frontend-web:
	- docker build -t platfor-frontend .
	- docker run -d --name platfor-frontend -p 80:80 platfor-frontend

Pronto! Seu container com a aplicação referente ao frontent está disponivel, acesso em: http://localhost/

### Atualização do repositório

Para atualizar o repositório do front-end basta mover o conteúdo que foi atualizado no GitHub e substituir pelo que está no Gitlab. Os arquivos que não podem ser atualizados são o Dockerfile

Os comandos a seguir mostram o passo a passo da atualização:

```sh
# 1. Criar pasta para os projetos
mkdir plat-fot

# 2. Clonar repositório do backend (via SSH)
git clone ssh://git@gitlab.rnp.br:2022/platfor/frontend.git

# 3. Clonar repositório do Github (via HTTPS)
git clone https://github.com/forpdi/plataforma-for.git

# 4. Atualizando backend
rm -rf ./frontend/*
cp -r ./plataforma-for/frontend-web/* ./frontend/

# 5. Versionando as alterações (Substituir COMMIT_MESSAGE)
git add . && git commit -m "COMMIT_MESSAGE"
git push
```
