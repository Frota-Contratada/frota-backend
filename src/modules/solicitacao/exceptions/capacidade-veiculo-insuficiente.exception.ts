import { ConflictException } from '@nestjs/common';

export class CapacidadeVeiculoInsuficienteException extends ConflictException {
  constructor(nomeVeiculo: string, capacidade: number, quantidade: number) {
    super(
      `O veículo ${nomeVeiculo} comporta até ${capacidade} passageiros, mas a viagem tem ${quantidade} passageiros.`,
    );
  }
}
