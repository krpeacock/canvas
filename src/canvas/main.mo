import Array "mo:base/Array";
import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Trie "mo:base/Trie";

actor {
    type Image = [[Text]];

    type Error = {
        #InsufficientCycles;
        #BadRequest;
    };

    type SuccessUpdate = {
        newHeight: Nat;
        accountBalance: Nat; 
    };

    stable var ledger : Trie.Trie<Principal, Nat> = Trie.empty();
    stable var balance = 0;
    stable var historyLength : Nat = 0;
    var size = 400;

    var emptyImage: Image = Array.freeze(Array.init<[Text]>(400, Array.freeze(Array.init<Text>(400, "#000000"))));
    
    stable var history: [Image] = [emptyImage];


    // cost per pixel is ten million cycles
    var price = 10000000;

    // Fetch the most recent image
    public query func latest() : async Image {
        return history[historyLength];
    };

    // Get all images
    public query func getHistory() : async [Image]{
        return history;
    };

    type DiffSize = Nat;

    func compareImages(oldImage: Image, newImage: Image): DiffSize {
        var diffSize = 0;
        var y = 0;
        var x = 0;
        while (y < 400){
            while(x < 400){
                let oldValue = oldImage[y][x];
                let newValue = newImage[y][x];
                let equal = Text.equal(oldValue,newValue);
                if(not equal){
                    Debug.print(oldValue);
                    Debug.print(newValue);
                    diffSize:= diffSize + 1;
                };
                x:= x + 1;
            };
            y:= y + 1;
        };
        return diffSize;
    };

    public shared({ caller }) func wallet_receive() : async Nat {
        let amount = Cycles.available();
        let accepted = Cycles.accept(amount);
        assert(accepted > 0);

        let existingBalance = Trie.find(ledger, key(caller), Principal.equal);
        var balance:Nat = accepted;
        switch(existingBalance){
            case(null){};
            case (?v){
                balance := balance + v;
            };
        };

        let result = Trie.put(
            ledger,
            key(caller),
            Principal.equal,
            balance
        );

        return accepted;
    };

    public shared({caller}) func upload(image: Image) : async Result.Result<SuccessUpdate, Error> {
        let oldImage: Image = history[historyLength];
        let pixelsChanged = compareImages(oldImage, image);

        let cost = pixelsChanged * price;

        let existingBalance = Trie.find(ledger, key(caller), Principal.equal);
        var balance:Nat = 0;
        switch(existingBalance){
            case(null){};
            case (?v){
                balance := balance + v;
            };
        };
        
        // If adequate amount, accept the update
        if(balance >= cost){
            history := Array.append(history, [image]);
            historyLength := historyLength + 1;

            let newBalance = Nat.sub(balance, cost);

            let update = Trie.put(
                ledger,
                key(caller),
                Principal.equal,
                newBalance
            );

            return #ok({
                newHeight = historyLength;
                accountBalance = newBalance;
            });
        };

        return  #err(#InsufficientCycles);
    };

    private func key(x : Principal) : Trie.Key<Principal> {
        return { key = x; hash = Principal.hash(x) }
    };
};
