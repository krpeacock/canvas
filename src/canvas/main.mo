import Array "mo:base/Array";
import Cycles "mo:base/ExperimentalCycles";
import Iter "mo:base/Iter";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Debug "mo:base/Debug";

actor {
    type Image = [[Text]];

    type Error = {
        #InsufficientCycles;
        #BadRequest;
    };

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

    public func upload(image: Image) : async Result.Result<(Nat, Nat, Nat), Error> {
        let oldImage: Image = history[historyLength];
        let pixelsChanged = compareImages(oldImage, image);

        let cost = pixelsChanged * price;

        let amount = Cycles.available();
        
        // Commented for development
        // let accepted = Cycles.accept(cost);
        let accepted = cost;

        // If adeuqate amount, accept the update
        if(accepted == cost){
            history := Array.append(history, [image]);
            historyLength := historyLength + 1;
            return #ok((pixelsChanged, amount, cost));
        };

        return  #err(#InsufficientCycles);
    };
};
