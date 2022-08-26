# setup.sh

# start clean
dfx stop
dfx start --background --clean

dfx deploy canvas_backend

dfx deploy dialectic_nft --argument '(opt record{custodians=opt vec{principal"ld355-gfjoe-2j6u4-huivi-cfdvi-qvihl-cyhkr-su63z-xpigb-ahldh-fqe"}})'
dfx canister call dialectic_nft setCustodians "(vec {principal \"ld355-gfjoe-2j6u4-huivi-cfdvi-qvihl-cyhkr-su63z-xpigb-ahldh-fqe\"})"
dfx deploy canvas_assets
dfx canister call canvas_assets authorize "(principal  \"ld355-gfjoe-2j6u4-huivi-cfdvi-qvihl-cyhkr-su63z-xpigb-ahldh-fqe\")"
