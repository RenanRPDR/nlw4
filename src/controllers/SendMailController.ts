import { Request, Response } from "express";
import { resolve } from 'path';
import { getCustomRepository } from "typeorm";
import { AppError } from "../errors/AppErros";
import { SurveysRepository } from "../repositories/SurveysRepository";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRepository";
import { UsersRepository } from "../repositories/UsersRepository";
import SendMailService from "../services/SendMailService";


class SendMailController {
  
  async execute(request: Request, response: Response) {
    const { email, survey_id } = request.body;

    const usersRepository = getCustomRepository(UsersRepository);
    const surveyRepository = getCustomRepository(SurveysRepository);
    const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

    const user = await usersRepository.findOne({email});

    if(!user) { throw new AppError("User does not exists.") };
      /** Forma anterior de tratar o erro. */
      // return response.status(400).json({
      //  error: "User does not exists.",
      // });

    // Verifica se o id recebido e igual ao survey_id existente no banco
    const survey = await surveyRepository.findOne({id: survey_id});
    
    if(!survey) { throw new AppError("Survey does not exists."); };      
      /** Forma anterior de tratar o erro. */
      // return response.status(400).json({
      //  error: "Survey does not exists.",
      // });
        
    const npsPath = resolve(__dirname, "..", "views", "emails", "npsMail.hbs");
    
    const surveyUserAlreadyExists = await surveysUsersRepository.findOne({
      where: [{user_id: user.id, value: null}],
      relations: ["user", "survey"],
    });
    
    const variables = {
      name: user.name,
      title: survey.title,
      description: survey.description,
      id: "",
      link: process.env.URL_MAIL
    };

    if(surveyUserAlreadyExists) {
      variables.id = surveyUserAlreadyExists.id;
      await SendMailService.execute(email, survey.title, variables, npsPath);
      return response.json(surveyUserAlreadyExists);
    };

    // Salvar as informacoes na tabela surveyUser
    const surveyUser = surveysUsersRepository.create({
      user_id: user.id,
      survey_id
    });

    await surveysUsersRepository.save(surveyUser);
    
    // Enviar e-mail para o usuario
    variables.id = surveyUser.id;    

    await SendMailService.execute(email, survey.title, variables, npsPath);

    return response.json(surveyUser);
  }

}

export { SendMailController };

