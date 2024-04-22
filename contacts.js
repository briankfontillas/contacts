const express = require("express");
const morgan = require("morgan");
const app = express();
const ALPHA = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";

let contactData = [
  {
    firstName: "Mike",
    lastName: "Jones",
    phoneNumber: "281-330-8004",
  },
  {
    firstName: "Jenny",
    lastName: "Keys",
    phoneNumber: "768-867-5309",
  },
  {
    firstName: "Max",
    lastName: "Entiger",
    phoneNumber: "214-748-3647",
  },
  {
    firstName: "Alicia",
    lastName: "Keys",
    phoneNumber: "515-489-4608",
  },
];

const sortContacts = contacts => {
  return contacts.slice().sort((contactA, contactB) => {
    if (contactA.lastName < contactB.lastName) {
      return -1;
    } else if (contactA.lastName > contactB.lastName) {
      return 1;
    } else if (contactA.firstName < contactB.firstName) {
      return -1;
    } else if (contactA.firstName > contactB.firstName) {
      return 1;
    } else {
      return 0;
    }
  });
};

const isUnique = (firstName, lastName) => {
  for (let contact of contactData) {
    if (contact.firstName === firstName &&
        contact.lastName === lastName) return false;
  }

  return true;

}

const containsNonAlpha = str => {
  str = str.toLowerCase();

  for (let i = 0; i < str.length; i ++) {
    if (!ALPHA.includes(str[i])) return true;
  }

  return false;
}

const isUSPhoneNumber = phoneNumber => {
  //check sets
  let numsArray = phoneNumber.split('-');
  if (numsArray[0].length !== 3 ||
      numsArray[1].length !== 3 ||
      numsArray[2].length !== 4) return false;
  //check length
  let onlyNums = numsArray.join('');
  if (onlyNums.length !== 10) return false;

  //check characters
  for (let i = 0; i < onlyNums.length; i++) {
    if (!NUMBERS.includes(onlyNums[i])) {
      return false;
    }
  }

  return true;

}

app.set("views", "./views");
app.set("view engine", "pug");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(morgan("common"));

app.get("/", (req, res) => {
  res.redirect("/contacts");
});

app.get("/contacts", (req, res) => {
  res.render("contacts", {
    contacts: sortContacts(contactData),
  });
});

app.get("/contacts/new-contact", (req, res) => {
  res.render("new-contact");
});

app.post("/contacts/new-contact",
  (req, res, next) => {
    res.locals.errorMessages = [];
    next();
  },
  (req, res, next) => {
    if (req.body.firstName.length === 0) {
      res.locals.errorMessages.push("First name is required.");
    }

    next();
  },
  (req, res, next) => {
    if (req.body.lastName.length === 0) {
      res.locals.errorMessages.push("Last name is required.");
    }

    next();
  },
  (req, res, next) => {
    if (req.body.phoneNumber.length === 0) {
      res.locals.errorMessages.push("Phone number is required.");
    }

    next();
  },
  (req, res, next) => {
    if (req.body.firstName.length > 25) {
      res.locals.errorMessages.push("First name exceeds character limit of 25");
    }

    next();
  },
  (req, res, next) => {
    if (req.body.lastName.length > 25) {
      res.locals.errorMessages.push("Last name exceeds character limit of 25");
    }

    next();
  },
  (req, res, next) => {
    if (containsNonAlpha(req.body.firstName)) {
      res.locals.errorMessages.push("Please enter valid first name");
    }

    next();
  },
  (req, res, next) => {
    if (containsNonAlpha(req.body.lastName)) {
      res.locals.errorMessages.push("Please enter valid last name");
    }

    next();
  },
  (req, res, next) => {
    if (!isUSPhoneNumber(req.body.phoneNumber)) {
      res.locals.errorMessages.push("Please enter valid phone number in the correct format");
    }

    next();
  },
  (req, res, next) => {
    if (!isUnique(req.body.firstName, req.body.lastName)) {
      res.locals.errorMessages.push("Contact already exists");
    }

    next();
  },
  (req, res, next) => {
    if (res.locals.errorMessages.length > 0) {
      res.render("new-contact", {
        errorMessages: res.locals.errorMessages,
        firstName: res.locals.firstName,
        lastName: res.locals.lastName,
        phoneNumber: res.locals.phoneNumber,
      });
    } else {
      next();
    }
  },
  (req, res) => {
    contactData.push({
      firstName: req.body.firstName.trim(),
      lastName: req.body.lastName.trim(),
      phoneNumber: req.body.phoneNumber.trim(),
    });

    res.redirect("/contacts");
  }
);

app.listen(3000, "localhost", () => {
  console.log("Listening to port 3000.");
});