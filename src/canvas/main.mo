import Array "mo:base/Array";
import Result "mo:base/Result";
import Cycles "mo:base/ExperimentalCycles";

actor {
    type Image = [[Text]];

    type Error = {
        #InsufficientCycles;
        #BadRequest;
    };

    stable var balance = 0;
    stable var historyLength : Nat = 0;

    var emptyImage: Image = Array.freeze(Array.init<[Text]>(500, Array.freeze(Array.init<Text>(500, "#000000"))));
    
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

    public func insertImage(image: Image, pixelsChanged: Nat) : async Result.Result<(), Error> {
        let cost = pixelsChanged * price;

        let amount = Cycles.available();
        
        // Commented for development
        // let accepted = Cycles.accept(cost);
        let accepted = cost;

        // If adeuqate amount, accept the update
        if(accepted == cost){
            history := Array.append(history, [image]);
            historyLength := historyLength + 1;
            return #ok(());
        };

        return  #err(#InsufficientCycles);
    };
};
