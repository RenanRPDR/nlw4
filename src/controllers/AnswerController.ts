import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { AppError } from "../errors/AppErros";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRepository";

// http://localhost:3334/answers/1?u=0c3e491d-669a-4226-9faf-46f74954527d
/** Route and Query params
  Route Params => Parametros que compoe a rota
  router.get("/answers/:value")
  
  Query Params => Busca, Paginacao, nao obrigatorios
  ?
  chave=valor 
 */

class AnswerController {

  async execute(request: Request, response: Response) {
    const { value } = request.params;
    const { u } = request.query;

    const surveyUsersRepository = getCustomRepository(SurveysUsersRepository);

    const surveyUser = await surveyUsersRepository.findOne({
      id: String(u)
    });

    if(!surveyUser) {
      throw new AppError("Survey User does not exists!");              
    };
    /** Forma anterior de tratar o erro. */
      // return response.status(400).json({
      //   error: "Survey User does not exists!"
      // })
      
    surveyUser.value = Number(value);

    await surveyUsersRepository.save(surveyUser);

    return response.json(surveyUser);
  };
};

export { AnswerController };

