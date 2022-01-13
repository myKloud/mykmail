import React from "react";
import srp from "secure-remote-password/client"

function InfoCredentials(ServerEphemeral,Salt , username , password) {
       
        if (Salt){
            const clientEphemeral = srp.generateEphemeral()
            const secret = srp.derivePrivateKey(Salt, username, password)
            const clientSession = srp.deriveSession(clientEphemeral.secret, ServerEphemeral, Salt, username, secret)
            
            return {clientEphemeral : clientEphemeral.public , clientProof:clientSession.proof }
        }
        
   
}
  
export default InfoCredentials;