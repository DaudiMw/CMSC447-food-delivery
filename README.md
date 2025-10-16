# CMSC447-food-delivery


# Backend setup instructions
- Make sure python is installed on your system
- In VSCode press ctrl+shift+p and select virtual env as your interpreter
- Select the Python version you have installed on the machine
- Install the needed dependencies with pip install -r requirements.txt (Also if you add more python dependencies make sure to add them using pip freeze > requirements.txt)
- Create a .env file and in that file add what is shown in the .env.example file
- run fastapi dev main.py for the server to start.
- If you want to view the local db in vscode download the "SQLite" extension in vscode by alexcvzz then when you right click the db you should be able to view it using "Open Database".