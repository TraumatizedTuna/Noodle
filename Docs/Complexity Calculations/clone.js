            clone(noodle, obj, clone, flatList = [], flatClone = []) {
                //flatClone.push(clone);
                if (obj == null || obj == undefined)
                    return obj;
 
                if (typeof obj == 'object') {
                    //If clone is undefined, make it an empty array or object
                    if (clone == undefined){
                        if(obj.constructor == Array){
                            clone = [];
                        }
                        else{
                            clone = {};
                        }
                    }
                    flatList.push(obj);
                    flatClone.push(clone);
                    //Go through obj to clone all its properties
                    for (var i in obj) { 
                        var flatInd = flatList.indexOf(obj[i]);
                        //If we've found a new object, add it to flatList and clone it to clone and flatClone
                        if (flatInd == -1) {
                            //clone[i] = clone[i] || {};
                            clone[i] = noodle.object.clone(noodle, obj[i], clone[i], flatList, flatClone); //This works because flatList gets updated
                        }
                        //If we've seen obj[i] before, add the clone of it to clone
                        else {
                            clone[i] = flatClone[flatInd];
                        }
                    }
                    return clone;
                }
                return obj;
            },
 
 

