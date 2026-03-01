/**
 * Whitelabel Controller
 *
 * Controller HTTP para operações de Whitelabel
 * Expõe endpoints RESTful para a API
 */

import { Elysia, t } from 'elysia';
import { GetWhitelabelConfig } from '@application/whitelabel/use-cases/get-whitelabel-config.use-case';
import { UpdateWhitelabelConfig } from '@application/whitelabel/use-cases/update-whitelabel-config.use-case';

export class WhitelabelController {
  public routes: Elysia;

  constructor(
    private readonly getConfigUseCase: GetWhitelabelConfig,
    private readonly updateConfigUseCase: UpdateWhitelabelConfig
  ) {
    this.routes = this.createRoutes();
  }

  /**
   * Cria as rotas do controller
   */
  private createRoutes(): Elysia {
    return new Elysia({ prefix: '/whitelabel' })
      // GET /whitelabel/config - Buscar configuração atual
      .get('/config', async () => {
        const result = await this.getConfigUseCase.execute();

        return {
          config: this.toResponse(result.config),
          isNew: result.isNew,
        };
      })

      // POST /whitelabel/config - Atualizar ou criar configuração
      .post(
        '/config',
        async ({ body }) => {
          const result = await this.updateConfigUseCase.execute({
            logoUrl: body.logoUrl,
            primaryColor: body.primaryColor,
            secondaryColor: body.secondaryColor,
            companyName: body.companyName,
            subdomain: body.subdomain,
          });

          return {
            config: this.toResponse(result.config),
            created: result.created,
          };
        },
        {
          body: t.Object({
            logoUrl: t.Optional(t.Nullable(t.String())),
            primaryColor: t.Optional(t.String()),
            secondaryColor: t.Optional(t.String()),
            companyName: t.Optional(t.String()),
            subdomain: t.Optional(t.Nullable(t.String())),
          }),
        }
      );
  }

  /**
   * Mapeia a entidade para resposta HTTP
   */
  private toResponse(config: {
    id: string;
    logoUrl: string | null;
    primaryColor: string;
    secondaryColor: string;
    companyName: string;
    subdomain: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Record<string, any> {
    return {
      id: config.id,
      logoUrl: config.logoUrl,
      primaryColor: config.primaryColor,
      secondaryColor: config.secondaryColor,
      companyName: config.companyName,
      subdomain: config.subdomain,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }
}
