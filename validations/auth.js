login = (Joi, data) => {
    const schema = Joi.object().keys({
        name: Joi.string().min(3).max(30).required().error(errors => {
          errors.forEach(err => {
            switch (err.type) {
              case "any.empty":
                err.message = `${err.context.label}_${err.context.label} is required`;
                break;
              case "string.min":
                err.message = `${err.context.label}_${err.context.label} should be minimum 3 characters in length`;
                break;
              case "string.max":
                err.message = `${err.context.label}_${err.context.label} should be maximum 30 characters in length`;
                break;
              default:
                break;
            }
          });
          return errors;
        }),
        password: Joi.string().required().regex(/^[a-zA-Z0-9]{3,30}$/).error(errors => {
          errors.forEach(err => {
            switch (err.type) {
              case "any.empty":
                err.message = `${err.context.label}_${err.context.label} is required`;
                break;
              case "string.regex.base":
                err.message = `${err.context.label}_Invalid characters in ${err.context.label}`;
                break;
              default:
                break;
            }
          });
          return errors;
        }),
        email: Joi.string().email({ minDomainSegments: 2 })
    });
    return Joi.validate(data, schema,{abortEarly: false}, (err, value) => {
    if (err) {
        // send a 422 error response if validation fails
        let validationErrors = [];
        for(let i=0; i<err.details.length; i++) {
          let field = err.details[i].message.split('_');
          validationErrors.push({[field[0]]: field[1]});
        }
        let errorsArr =  { status: 'error', message: validationErrors };
        return errorsArr;
    }
  });
};

module.exports.login = login;