import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderService } from '../../layout/header.service';

interface PerfilUsuario {
  nome: string;
  email: string;
  cargo: string;
  departamento: string;
  avatar?: string;
}

@Component({
  selector: 'app-conta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './conta.component.html',
  styleUrl: './conta.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContaComponent implements OnInit {
  private readonly header = inject(HeaderService);

  // User profile state
  readonly perfil = signal<PerfilUsuario>({
    nome: 'João Silva',
    email: 'joao.silva@allservice.com',
    cargo: 'Gerente de Operações',
    departamento: 'Operacional',
    avatar: undefined,
  });

  readonly editando = signal(false);
  readonly salvando = signal(false);

  // Password change state
  readonly mostrarSenha = signal(false);
  readonly senhaAtual = signal('');
  readonly novaSenha = signal('');
  readonly confirmarSenha = signal('');

  constructor() {
    effect(() => {
      this.header.setHeader('Minha Conta', []);
      this.header.setSearch(null);
    });
  }

  ngOnInit(): void {
    // Load user data from backend/localStorage
    this.carregarDadosUsuario();
  }

  private carregarDadosUsuario(): void {
    // TODO: Load from API
    // For now, using mock data from signal initialization
  }

  iniciarEdicao(): void {
    this.editando.set(true);
  }

  cancelarEdicao(): void {
    this.editando.set(false);
    // Reset to original values
    this.carregarDadosUsuario();
  }

  salvarPerfil(): void {
    this.salvando.set(true);

    // TODO: Send to API
    setTimeout(() => {
      this.salvando.set(false);
      this.editando.set(false);
    }, 1000);
  }

  alterarSenha(): void {
    if (!this.senhaAtual() || !this.novaSenha() || !this.confirmarSenha()) {
      alert('Preencha todos os campos');
      return;
    }

    if (this.novaSenha() !== this.confirmarSenha()) {
      alert('As senhas não coincidem');
      return;
    }

    // TODO: Send to API
    this.senhaAtual.set('');
    this.novaSenha.set('');
    this.confirmarSenha.set('');
    this.mostrarSenha.set(false);
  }

  uploadAvatar(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      this.perfil.update(p => ({ ...p, avatar: e.target?.result as string }));
    };

    reader.readAsDataURL(file);
  }

  removerAvatar(): void {
    this.perfil.update(p => ({ ...p, avatar: undefined }));
  }
}

