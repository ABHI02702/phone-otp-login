cd /d E:\APPLICATION\phone-otp-login
set commitmsg=Auto update %date% %time%
git add .
git commit -m "%commitmsg%"
git push origin main
pause
