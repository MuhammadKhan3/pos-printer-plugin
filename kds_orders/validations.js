const {body,validationResult}=require('express-validator')

const add_kds_order_validation=[
    body('business_id').notEmpty()
    .withMessage('business_id is required'),
    body('order').isArray({min:1}).withMessage("Minimum One Order is required"),
    (req,res,next)=>{

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(403).json({ errors: errors.array() });
        }
        next();
    }
]


const get_kds_order_validation=[
    body('business_id').notEmpty()
    .withMessage('business_id is required'),
    (req,res,next)=>{
        const errors=validationResult(req);
        if(!errors.isEmpty()){
            return res.status(403).json({errors:errors.array()})
        }
        next();
    }
]

const udpate_kds_order_validation=[
    body('type').notEmpty()
    .withMessage('type is required'),
    (req,res,next)=>{
        const errors=validationResult(req);
        if(!errors.isEmpty()){
            return res.status(403).json({errors:errors.array()})
        }
        next();
    }
]
module.exports={add_kds_order_validation,get_kds_order_validation,udpate_kds_order_validation}