/**
 * WhitelabelConfig Entity
 *
 * Representa a configuração de whitelabel do sistema
 */

import { BaseEntity } from '@domain/common/entities/base.entity';
import type { BaseEntityProps } from '@domain/common/entities/base.entity';

export interface WhitelabelConfigProps extends BaseEntityProps {
  id: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  companyName: string;
  subdomain: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWhitelabelConfigProps {
  logoUrl?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  companyName?: string;
  subdomain?: string | null;
}

export class WhitelabelConfig extends BaseEntity<WhitelabelConfigProps> {
  private constructor(props: WhitelabelConfigProps) {
    super(props);
  }

  /**
   * Cria uma nova configuração de whitelabel com valores padrão
   */
  static create(props: CreateWhitelabelConfigProps = {}): WhitelabelConfig {
    const now = new Date();

    return new WhitelabelConfig({
      id: crypto.randomUUID(),
      logoUrl: props.logoUrl ?? null,
      primaryColor: props.primaryColor?.trim() ?? '#3B82F6',
      secondaryColor: props.secondaryColor?.trim() ?? '#1E40AF',
      companyName: props.companyName?.trim() ?? 'Podcast SaaS',
      subdomain: props.subdomain?.trim() ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Cria uma configuração a partir de props existentes (para recuperação do banco)
   */
  static fromProps(props: WhitelabelConfigProps): WhitelabelConfig {
    return new WhitelabelConfig(props);
  }

  /**
   * Retorna a URL do logo
   */
  get logoUrl(): string | null {
    return this.props.logoUrl;
  }

  /**
   * Retorna a cor primária
   */
  get primaryColor(): string {
    return this.props.primaryColor;
  }

  /**
   * Retorna a cor secundária
   */
  get secondaryColor(): string {
    return this.props.secondaryColor;
  }

  /**
   * Retorna o nome da empresa
   */
  get companyName(): string {
    return this.props.companyName;
  }

  /**
   * Retorna o subdomínio
   */
  get subdomain(): string | null {
    return this.props.subdomain;
  }

  /**
   * Atualiza a URL do logo
   */
  updateLogoUrl(logoUrl: string | null): void {
    this.props.logoUrl = logoUrl;
    this.touch();
  }

  /**
   * Atualiza a cor primária
   */
  updatePrimaryColor(primaryColor: string): void {
    this.props.primaryColor = primaryColor.trim();
    this.touch();
  }

  /**
   * Atualiza a cor secundária
   */
  updateSecondaryColor(secondaryColor: string): void {
    this.props.secondaryColor = secondaryColor.trim();
    this.touch();
  }

  /**
   * Atualiza o nome da empresa
   */
  updateCompanyName(companyName: string): void {
    this.props.companyName = companyName.trim();
    this.touch();
  }

  /**
   * Atualiza o subdomínio
   */
  updateSubdomain(subdomain: string | null): void {
    this.props.subdomain = subdomain?.trim() ?? null;
    this.touch();
  }

  /**
   * Atualiza todas as configurações de uma vez
   */
  updateAll(props: CreateWhitelabelConfigProps): void {
    if (props.logoUrl !== undefined) {
      this.props.logoUrl = props.logoUrl ?? null;
    }
    if (props.primaryColor !== undefined) {
      this.props.primaryColor = props.primaryColor.trim() ?? '#3B82F6';
    }
    if (props.secondaryColor !== undefined) {
      this.props.secondaryColor = props.secondaryColor.trim() ?? '#1E40AF';
    }
    if (props.companyName !== undefined) {
      this.props.companyName = props.companyName.trim() ?? 'Podcast SaaS';
    }
    if (props.subdomain !== undefined) {
      this.props.subdomain = props.subdomain?.trim() ?? null;
    }
    this.touch();
  }

  /**
   * Verifica se a configuração usa valores padrão
   */
  isDefault(): boolean {
    return (
      this.props.logoUrl === null &&
      this.props.primaryColor === '#3B82F6' &&
      this.props.secondaryColor === '#1E40AF' &&
      this.props.companyName === 'Podcast SaaS' &&
      this.props.subdomain === null
    );
  }

  /**
   * Converte para objeto simples
   */
  override toObject(): WhitelabelConfigProps {
    return { ...this.props };
  }
}
