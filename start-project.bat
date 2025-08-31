@echo off
echo Starting Snap_Stake Project Setup...

echo.
echo 1. Setting up environment...
if not exist .env (
    copy .env.example .env
    echo Created .env file - please add your PRIVATE_KEY
)

echo.
echo 2. Installing Node.js dependencies...
npm install

echo.
echo 3. Installing Python backend dependencies...
cd backend
pip install fastapi uvicorn python-dotenv web3 httpx pydantic
cd ..

echo.
echo 4. Installing mobile app dependencies...
cd mobile
npm install
cd ..

echo.
echo Setup complete! Now run the following commands in separate terminals:
echo.
echo Backend: cd backend && python -m uvicorn main:app --reload --port 8000
echo Mobile:  cd mobile && npx expo start
echo Widget:  Open widgets/checkout-widget.html in browser
echo.
pause
