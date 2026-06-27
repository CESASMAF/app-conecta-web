// Harness de testes (T007): registra os globais de DOM (happy-dom) para os testes
// de page/component/binding. Pré-carregado via bunfig.toml [test].preload.
// Testes PUROS (domain/application/view-model/data) não dependem disto.
import { GlobalRegistrator } from '@happy-dom/global-registrator'

GlobalRegistrator.register()
