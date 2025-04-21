function Validation(values) 
{
  let error = {}
  const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const password_pattern = /^(?=.\d)(?=.[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,}$/
  const name_pattern = /^[a-zA-Z]+(?: [a-zA-Z]+)*$/
  //const age_pattern = /^([1-9]?[0-9])$/
  //name
if(values.name === "") 
  {        
    error.name = "Name should not be empty"    
  }     
else if(!name_pattern.test(values.name)) 
  {        
    error.name = "Enter name correctly"    
  }    
  else 
  {        
    error.name = ""    
  }
//age
if(values.age === "") 
  {        
    error.age = "Age should not be empty"    
  }     
// else if(!age_pattern.test(values.name)) 
//   {        
//     error.age = "Enter correct age"    
//   }    
  else if(parseInt(values.age)<5)
  {        
    error.age = "Not allowed to register"    
  }
  else{
    error.age=""
  }
//email
  if(values.email === "") 
    {        
      error.email = "Email should not be empty"    
    }     
  else if(!email_pattern.test(values.email)) 
    {        
      error.email = "Enter correct email format"    
    }    
    else 
    {        
      error.email = ""    
    }

//password
if(values.password === "") 
  {        
    error.password = "Password should not be empty"    
  }     
else if(!password_pattern.test(values.password)) 
  {        
    error.password = "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one digit.";    
  }  
  else {        
    error.password = ""    
  }       
// //confirm password
// if(values.confirmPassword !== values.password) 
//   {        
//     error.confirmPassword = "Password should match"    
//   }  
//   return error;  
}

export default Validation;