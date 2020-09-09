What does not work:
- making a new post
- mark articles as favorites


curl -i \
     -H "Content-Type: application/json" \
     -X POST \
     -d '{"user":{"name":"gandalf","username":"gandalf","password":"fly"}}' \
      https://hack-or-snooze-v3.herokuapp.com/signup


      token: yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImdhbmRhbGYiLCJpYXQiOjE1OTk1MDc5NzR9.jyqMqSbJ7zaU5Gv0HGAjk-QQwXCZVrGRuX76GYVFpWQ


      curl -i \
     -H "Content-Type: application/json" \
     -X POST \
     -d '{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImdhbmRhbGYiLCJpYXQiOjE1OTk1MjQyMDV9.3IQjInci84KsUXYXEOOlvFA4TxOOJr4Ayqx5oEuLDXE", "story": {"author":"Elie Schoppik","title":"Four Tips for Moving Faster as a Developer", "url": "https://www.rithmschool.com/blog/developer-productivity"} }' \
      https://hack-or-snooze-v3.herokuapp.com/stories



      to add favorite

      // checkbox checked listener

        // checked

        <!-- // update local storage --> may not be necessary

        // send request to server

        // reload list, with check for favorites, if favorite, append star/keep checkboax checked etc


        // need is favorite story function

            // user has favorites? return false

            // yes 
            
                // is curent story a favorite (check ID) 
                    
                    // yes, return true

                    // no return false



        based on result append



to do:


- get rid of spans
- get rid of unnecessary class functions
- trash can gets brought over if favorite added from my stories list

