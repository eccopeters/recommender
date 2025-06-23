

export async function errorHandler(error, req, res, next){
  console.log(error.message)
  res.status(500).json({error: ["Server Error", error.message]})
}