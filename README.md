# Formulario
Formulario de envio de docs
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
  <title>Envio Documentos</title>
  <link rel="stylesheet" href="style.css" />
  <script type="importmap">
  {
    "imports": {
      "jszip": "https://esm.sh/jszip@4.0.1",
      "file-saver": "https://esm.sh/file-saver@2.0.5"
    }
  }
  </script>
</head>
<body>
  <main id="app">
    <form id="docForm" autocomplete="off" novalidate>
      <div class="grid">
        <label class="full">
          Nome
          <input name="name" id="name" type="text" placeholder="Seu nome completo" required />
        </label>

        <label class="full">
          Cidade
          <input name="city" id="city" type="text" placeholder="Cidade (Ex: São Paulo)" required />
        </label>

        <label class="full">
          Telefone para contato
          <input name="phone" id="phone" type="tel" placeholder="+55 (11) 9____-____" required />
        </label>

        <label class="full">
          E-mail
          <input name="email" id="email" type="email" placeholder="seu@exemplo.com" required />
        </label>

        <fieldset>
          <legend>Documentos (envie foto ou PDF)</legend>

          <label>RG (Cópia Identidade)
            <input type="file" data-key="rg" accept="image/*,.pdf" />
          </label>

          <label>CPF (Cópia)
            <input type="file" data-key="cpf" accept="image/*,.pdf" />
          </label>

          <label>Título de Eleitor (Cópia)
            <input type="file" data-key="titulo" accept="image/*,.pdf" />
          </label>

          <label>Certificado de Reservista (p/ homens)
            <input type="file" data-key="reservista" accept="image/*,.pdf" />
          </label>

          <label>CNH (Cópia)
            <input type="file" data-key="cnh" accept="image/*,.pdf" />
          </label>

          <label>Certidão de Casamento (se for casado(a))
            <input type="file" data-key="casamento" accept="image/*,.pdf" />
          </label>

          <label>Comprovante de Residência (atual)
            <input type="file" data-key="residencia" accept="image/*,.pdf" />
          </label>

          <label>Carteira de Trabalho Digital (arquivo)
            <input type="file" data-key="ctps" accept="image/*,.pdf" />
          </label>

          <label>Número do PIS (cópia com data de emissão)
            <input type="file" data-key="pis" accept="image/*,.pdf" />
          </label>

          <label>Exame Admissional
            <input type="file" data-key="exame" accept="image/*,.pdf" />
          </label>

          <label>Comprovante Conta Banco Itaú
            <input type="file" data-key="banco" accept="image/*,.pdf" />
          </label>

          <label>CPF dos Filhos (se aplicável)
            <input type="file" data-key="cpf_filhos" accept="image/*,.pdf" multiple />
          </label>

          <label>Certidão de Nascimento (filhos)
            <input type="file" data-key="certidao_nasc" accept="image/*,.pdf" multiple />
          </label>

        </fieldset>
      </div>

      <div class="actions">
        <button type="button" id="zipDownload">Baixar .zip</button>
        <button type="button" id="shareEmail">Enviar por E‑mail</button>
        <button type="button" id="shareWhats">Enviar por WhatsApp</button>
        <button type="button" id="testSend">Teste enviar</button>
      </div>

      <p class="note">Observação: selecione fotos ou PDFs. Use "Enviar" com WhatsApp/E‑mail em dispositivo que suporte compartilhamento de arquivos (mobile recomendado).</p>
    </form>

    <div id="status" aria-live="polite"></div>
  </main>

  <script type="module" src="app.js"></script>
</body>
</html>
