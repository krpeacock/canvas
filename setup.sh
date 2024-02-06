# setup.sh

# start clean
dfx stop
dfx start --background --clean

dfx deploy canvas_backend

# dfx deps for Internet Identity
dfx deps pull
dfx deps init internet-identity --argument "(null)"
dfx deps deploy

dfx deploy canvas_assets
