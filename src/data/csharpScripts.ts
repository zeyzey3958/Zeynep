/**
 * Unity C# Scripts & Documentation for "Çatı Çiftliği" (Rooftop Farm)
 * V5 Mimari: Yavaşça Yaklaşan Kamera + Çatıda Çoklu Atık Ayrıştırma (Drag & Drop) + Adım Adım Çatı İnşası (Yeşillendir & Güneş Paneli)
 */

export interface CSharpScriptFile {
  filename: string;
  title: string;
  description: string;
  purpose: string;
  unityComponentsUsed: string[];
  code: string;
  inspectorNotes: string[];
}

export const CSHARP_SCRIPTS: CSharpScriptFile[] = [
  {
    filename: 'GameManager.cs',
    title: '1. GameManager.cs (Oyun, Sıcaklık & Seviye Yöneticisi)',
    description: 'Şehir sıcaklığını (+2°C/sn), 60 saniyelik sayacı, seviye geçişlerini ve çatı inşaatı tamamlandığında sıcaklık düşüşünü (-15°C) koordine eden merkezi Singleton.',
    purpose: 'Oyunun genel kurallarını, termometre göstergesini ve seviye ilerleme mantığını kontrol eder.',
    unityComponentsUsed: ['UnityEngine.UI (Slider/Image)', 'TMPro (TextMeshProUGUI)', 'UnityEngine.SceneManagement', 'AudioSource'],
    inspectorNotes: [
      'Boş bir GameObject oluşturup adını "GameManager" yapın ve bu scripti ekleyin.',
      'Canvas üzerindeki Timer Text (TextMeshPro), Seviye Başlığı ve Termometre Slider/Image referanslarını bağlayın.',
      'GameOver Panel ve Seviye Tamamlandı (Victory) panellerini Inspector\'dan bağlayın.'
    ],
    code: `using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using UnityEngine.SceneManagement;

/// <summary>
/// Çatı Çiftliği - GameManager
/// 60s geri sayım, şehir sıcaklığı yönetimi (+2°C/sn) ve -15°C soğuma kontrolcüsü.
/// </summary>
public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }

    [System.Serializable]
    public class LevelData
    {
        public string levelName = "1. Konut Mahallesi";
        public int requiredBuildingsToComplete = 5;
        public float timeLimit = 60f;
        public float tempIncreaseRate = 2.0f; // Saniyede artan sıcaklık (+2°C/sn)
        public GameObject buildingsParent;    // Seviyedeki binaların ana nesnesi
    }

    [Header("--- Seviye (Level) Ayarları ---")]
    public int currentLevelIndex = 0;
    public List<LevelData> levels = new List<LevelData>();
    public TextMeshProUGUI levelTitleText;

    [Header("--- Zaman Ayarları ---")]
    public float timeRemaining = 60f;
    public TextMeshProUGUI timerText;
    public bool pauseTimerDuringRoofFocus = true; // Çatıya yakınlaşıldığında süreyi duraklat

    [Header("--- Şehir Sıcaklığı ---")]
    [Range(0f, 100f)]
    public float cityTemperature = 25f;
    public float tempReductionPerCleanedRoof = 15f; // Çatı bitince -15°C soğuma

    [Header("--- UI Göstergeleri ---")]
    public Slider temperatureSlider;
    public Image temperatureFillImage;
    public TextMeshProUGUI temperatureText;
    public TextMeshProUGUI progressText;

    [Header("--- Oyun Sonu & Zafer Panelleri ---")]
    public GameObject gameOverPanel;
    public GameObject victoryPanel;
    public GameObject levelCompleteBanner;
    public TextMeshProUGUI finalScoreText;

    [Header("--- Sesler ---")]
    public AudioSource audioSource;
    public AudioClip coolingChime;
    public AudioClip levelCompletedSound;
    public AudioClip gameOverSound;

    [Header("--- Durum Değişkenleri ---")]
    public bool isGameOver = false;
    public bool isRoofWorkspaceActive = false; // Oyuncu çatı üzerinde çalışırken
    public int completedInLevel = 0;
    public int totalScore = 0;

    private void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }
        Instance = this;
    }

    private void Start()
    {
        Time.timeScale = 1f;
        isGameOver = false;
        isRoofWorkspaceActive = false;

        if (gameOverPanel != null) gameOverPanel.SetActive(false);
        if (victoryPanel != null) victoryPanel.SetActive(false);
        if (levelCompleteBanner != null) levelCompleteBanner.SetActive(false);

        StartLevel(currentLevelIndex);
    }

    private void Update()
    {
        if (isGameOver) return;

        // Çatıdayken oyuncu rahatça atık ayrıştırabilsin diye süre duraklatılabilir
        if (isRoofWorkspaceActive && pauseTimerDuringRoofFocus) return;

        LevelData currentLevel = GetCurrentLevel();
        if (currentLevel == null) return;

        // 1) Geri sayım
        if (timeRemaining > 0)
        {
            timeRemaining -= Time.deltaTime;
            if (timeRemaining <= 0)
            {
                timeRemaining = 0;
                TriggerGameOver("Süre bitti! Kentsel ısı krizi engellenemedi.");
            }
        }

        // 2) Şehir sıcaklığı artışı (+2°C/sn)
        cityTemperature += currentLevel.tempIncreaseRate * Time.deltaTime;
        cityTemperature = Mathf.Clamp(cityTemperature, 0f, 100f);

        // 3) Sıcaklık 100°C'ye ulaşınca GameOver
        if (cityTemperature >= 100f)
        {
            TriggerGameOver("Şehir sıcaklığı 100°C kritik seviyeye ulaştı!");
        }

        UpdateUI();
    }

    /// <summary>
    /// Çatıdaki çöpler ayrıştırılıp yeşil çatı inşaatı tamamlandığında çağrılır.
    /// </summary>
    public void OnRoofCompletedAndDecorated()
    {
        if (isGameOver) return;

        // Sıcaklığı 15 derece düşür (-15°C)
        cityTemperature -= tempReductionPerCleanedRoof;
        cityTemperature = Mathf.Clamp(cityTemperature, 0f, 100f);

        completedInLevel++;
        totalScore += 300;

        if (audioSource != null && coolingChime != null)
        {
            audioSource.PlayOneShot(coolingChime);
        }

        UpdateUI();

        LevelData currentLevel = GetCurrentLevel();
        if (currentLevel != null && completedInLevel >= currentLevel.requiredBuildingsToComplete)
        {
            StartCoroutine(LevelCompletedRoutine());
        }
    }

    public void AddSortScore(int points = 50)
    {
        totalScore += points;
        UpdateUI();
    }

    private IEnumerator LevelCompletedRoutine()
    {
        if (audioSource != null && levelCompletedSound != null)
        {
            audioSource.PlayOneShot(levelCompletedSound);
        }

        if (levelCompleteBanner != null) levelCompleteBanner.SetActive(true);

        yield return new WaitForSeconds(2.0f);

        if (levelCompleteBanner != null) levelCompleteBanner.SetActive(false);

        if (currentLevelIndex >= levels.Count - 1)
        {
            TriggerVictory();
        }
        else
        {
            currentLevelIndex++;
            StartLevel(currentLevelIndex);
        }
    }

    private void StartLevel(int index)
    {
        if (index < 0 || index >= levels.Count) return;

        completedInLevel = 0;
        LevelData lvl = levels[index];
        timeRemaining = lvl.timeLimit;

        for (int i = 0; i < levels.Count; i++)
        {
            if (levels[i].buildingsParent != null)
            {
                levels[i].buildingsParent.SetActive(i == index);
            }
        }

        UpdateUI();
    }

    public LevelData GetCurrentLevel()
    {
        if (currentLevelIndex >= 0 && currentLevelIndex < levels.Count)
            return levels[currentLevelIndex];
        return null;
    }

    private void UpdateUI()
    {
        LevelData currentLevel = GetCurrentLevel();

        if (levelTitleText != null && currentLevel != null)
            levelTitleText.text = currentLevel.levelName;

        if (timerText != null)
            timerText.text = Mathf.CeilToInt(timeRemaining) + "s";

        if (temperatureText != null)
            temperatureText.text = Mathf.RoundToInt(cityTemperature) + "°C";

        if (temperatureSlider != null)
            temperatureSlider.value = cityTemperature / 100f;

        if (temperatureFillImage != null)
        {
            temperatureFillImage.fillAmount = cityTemperature / 100f;
            temperatureFillImage.color = Color.Lerp(Color.green, Color.red, cityTemperature / 100f);
        }

        if (progressText != null && currentLevel != null)
        {
            progressText.text = completedInLevel + " / " + currentLevel.requiredBuildingsToComplete;
        }
    }

    public void TriggerGameOver(string reason)
    {
        if (isGameOver) return;
        isGameOver = true;

        if (audioSource != null && gameOverSound != null) audioSource.PlayOneShot(gameOverSound);
        if (gameOverPanel != null) gameOverPanel.SetActive(true);
    }

    public void TriggerVictory()
    {
        if (isGameOver) return;
        isGameOver = true;

        if (victoryPanel != null)
        {
            victoryPanel.SetActive(true);
            if (finalScoreText != null)
            {
                finalScoreText.text = "Toplam Eko Skor: " + (totalScore + Mathf.RoundToInt(timeRemaining * 10));
            }
        }
    }

    public void RestartGame()
    {
        SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
    }
}`
  },
  {
    filename: 'RooftopSortingManager.cs',
    title: '2. RooftopSortingManager.cs (Çatıda Çoklu Atık Ayrıştırma Yöneticisi)',
    description: 'Bir çatıya yakınlaşıldığında çatıda rastgele saçılmış çöpleri (Plastik, Kağıt, Organik, Metal) yönetir. Çöpler bittikten sonra aşağıdaki çatı inşaat araç çubuğunu kilitlerini açarak aktif eder.',
    purpose: 'Çatıdaki atıkların sürükle-bırak ile kategorilerine ayrıştırılmasını ve temizlik bitiminde inşaat aşamasına geçilmesini sağlar.',
    unityComponentsUsed: ['List<DraggableTrashItem>', 'GameObject (UI Panels)', 'TMPro (TextMeshProUGUI)', 'AudioSource'],
    inspectorNotes: [
      'Çatının yakın çekim sahnesine veya paneline bu scripti ekleyin.',
      'Ayrıştırılacak çöp nesnelerini "initialTrashItems" listesine ekleyin.',
      'Geri dönüşüm kutularını (Plastik, Kağıt, Organik, Metal) "recyclingBins" referanslarına bağlayın.',
      'Temizlik bittiğinde açılacak çatı inşa panelini "roofDecorationPanel" slotuna atayın.'
    ],
    code: `using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;

public enum WasteType
{
    Plastic,  // Plastik şişe, bardak
    Paper,    // Gazete, karton
    Organic,  // Elma çöpü, yemek artığı
    Metal     // Meşrubat kutusu, pil
}

/// <summary>
/// Çatı Çiftliği - RooftopSortingManager
/// Çatıdaki çoklu çöplerin sürükle-bırak ile ayrıştırılmasını denetler.
/// </summary>
public class RooftopSortingManager : MonoBehaviour
{
    [Header("--- Çatıdaki Atıklar ---")]
    public List<DraggableTrashItem> trashItems = new List<DraggableTrashItem>();
    public TextMeshProUGUI remainingTrashText;

    [Header("--- Aşama Geçiş Panelleri ---")]
    [Tooltip("Tüm çöpler ayrıştırılınca açılacak çatı inşa ve dekorasyon paneli")]
    public GameObject roofDecorationPanel;
    public GameObject trashBinsPanel;

    [Header("--- Ses Efektleri ---")]
    public AudioSource audioSource;
    public AudioClip correctSortSound;
    public AudioClip wrongSortSound;
    public AudioClip allCleanedSound;

    private void Start()
    {
        // Başlangıçta dekorasyon paneli kilitli, çöp kutuları açık
        if (roofDecorationPanel != null) roofDecorationPanel.SetActive(false);
        if (trashBinsPanel != null) trashBinsPanel.SetActive(true);

        UpdateTrashUI();
    }

    /// <summary>
    /// Bir atık doğru geri dönüşüm kutusuna bırakıldığında kutu tarafından çağrılır
    /// </summary>
    public void OnTrashItemSortedCorrectly(DraggableTrashItem item)
    {
        if (trashItems.Contains(item))
        {
            trashItems.Remove(item);
        }

        if (audioSource != null && correctSortSound != null)
        {
            audioSource.PlayOneShot(correctSortSound);
        }

        if (GameManager.Instance != null)
        {
            GameManager.Instance.AddSortScore(50);
        }

        UpdateTrashUI();

        // Çatıdaki tüm çöpler bitti mi?
        if (trashItems.Count == 0)
        {
            OnAllTrashCleared();
        }
    }

    public void OnWrongSortAttempt()
    {
        if (audioSource != null && wrongSortSound != null)
        {
            audioSource.PlayOneShot(wrongSortSound);
        }
    }

    private void OnAllTrashCleared()
    {
        if (audioSource != null && allCleanedSound != null)
        {
            audioSource.PlayOneShot(allCleanedSound);
        }

        // Çöp kutularını gizle, çatı inşa panelini aç!
        if (trashBinsPanel != null) trashBinsPanel.SetActive(false);
        if (roofDecorationPanel != null) roofDecorationPanel.SetActive(true);

        if (remainingTrashText != null)
        {
            remainingTrashText.text = "🎉 Çatı Tertemiz! Şimdi Çatıyı İnşa Edin:";
        }
    }

    private void UpdateTrashUI()
    {
        if (remainingTrashText != null)
        {
            remainingTrashText.text = "Kalan Atık: " + trashItems.Count;
        }
    }
}`
  },
  {
    filename: 'DraggableTrashItem.cs',
    title: '3. DraggableTrashItem.cs (Sürüklenebilir Çöp Objesi)',
    description: 'Fare veya dokunmatik ekranla tutulup taşınabilen atık nesnesi. Yanlış yere bırakılırsa başladığı pozisyona yumuşakça geri döner (Snap Back). Doğru kutuya bırakıldığında efektle yok olur.',
    purpose: 'Unity EventSystems üzerinden akıcı ve hatasız Drag & Drop deneyimi sunar.',
    unityComponentsUsed: ['IBeginDragHandler', 'IDragHandler', 'IEndDragHandler', 'CanvasGroup', 'RectTransform / Transform'],
    inspectorNotes: [
      'Her çöp nesnesine (Plastik şişe, gazete, elma çöpü) bu scripti ekleyin.',
      'Inspector\'dan bu nesnenin "wasteType" türünü (Plastic, Paper, Organic, Metal) belirleyin.',
      'UI Canvas üzerinde ise nesneye bir "CanvasGroup" ekleyin (Blocks Raycasts için gereklidir).'
    ],
    code: `using System.Collections;
using UnityEngine;
using UnityEngine.EventSystems;

/// <summary>
/// Çatı Çiftliği - DraggableTrashItem
/// Sürüklenebilir atık nesnesi.
/// </summary>
public class DraggableTrashItem : MonoBehaviour, IBeginDragHandler, IDragHandler, IEndDragHandler
{
    public WasteType wasteType;
    public string wasteName = "Plastik Şişe";

    [Header("--- Referanslar ---")]
    public Canvas canvas;
    private RectTransform rectTransform;
    private CanvasGroup canvasGroup;
    private Vector3 initialLocalPosition;
    private Transform initialParent;

    public bool isSorted = false;

    private void Awake()
    {
        rectTransform = GetComponent<RectTransform>();
        canvasGroup = GetComponent<CanvasGroup>();
        if (canvas == null) canvas = GetComponentInParent<Canvas>();
    }

    private void Start()
    {
        initialLocalPosition = transform.localPosition;
        initialParent = transform.parent;
    }

    public void OnBeginDrag(PointerEventData eventData)
    {
        if (isSorted) return;

        // Sürüklenirken en üstte görünmesi için son sıraya al
        transform.SetAsLastSibling();

        if (canvasGroup != null)
        {
            canvasGroup.alpha = 0.75f;
            canvasGroup.blocksRaycasts = false; // Alttaki kutunun Drop algılaması için şarttır!
        }
    }

    public void OnDrag(PointerEventData eventData)
    {
        if (isSorted) return;

        if (canvas != null && rectTransform != null)
        {
            rectTransform.anchoredPosition += eventData.delta / canvas.scaleFactor;
        }
        else
        {
            Vector3 worldPos = Camera.main.ScreenToWorldPoint(eventData.position);
            worldPos.z = 0f;
            transform.position = worldPos;
        }
    }

    public void OnEndDrag(PointerEventData eventData)
    {
        if (isSorted) return;

        if (canvasGroup != null)
        {
            canvasGroup.alpha = 1.0f;
            canvasGroup.blocksRaycasts = true;
        }

        // Eğer geçerli bir kutuya bırakılmadıysa başlangıç noktasına geri dön
        StartCoroutine(SnapBackRoutine());
    }

    /// <summary>
    /// Kutu tarafından çağrılır, doğru ayrıştırmayı onaylar
    /// </summary>
    public void ConfirmSorted()
    {
        isSorted = true;
        StartCoroutine(DisappearRoutine());
    }

    private IEnumerator SnapBackRoutine()
    {
        float elapsed = 0f;
        float duration = 0.25f;
        Vector3 currentPos = transform.localPosition;

        while (elapsed < duration)
        {
            elapsed += Time.deltaTime;
            transform.localPosition = Vector3.Lerp(currentPos, initialLocalPosition, elapsed / duration);
            yield return null;
        }
        transform.localPosition = initialLocalPosition;
    }

    private IEnumerator DisappearRoutine()
    {
        Vector3 startScale = transform.localScale;
        float elapsed = 0f;
        float duration = 0.3f;

        while (elapsed < duration)
        {
            elapsed += Time.deltaTime;
            float t = elapsed / duration;
            transform.localScale = Vector3.Lerp(startScale, Vector3.zero, t);
            transform.Rotate(0, 0, 180f * Time.deltaTime);
            yield return null;
        }

        gameObject.SetActive(false);
    }
}`
  },
  {
    filename: 'TrashRecyclingBin.cs',
    title: '4. TrashRecyclingBin.cs (Geri Dönüşüm Hedef Kutusu)',
    description: 'Üzerine bırakılan atığın kategorisini kontrol eden hedef kutu. Doğru atık geldiğinde yeşil efektle kabul eder, yanlış atıkta ikaz verir.',
    purpose: 'Unity IDropHandler arayüzü ile atık eşleşmesini denetler.',
    unityComponentsUsed: ['IDropHandler', 'IPointerEnterHandler', 'IPointerExitHandler', 'Image (Renk vurgusu)'],
    inspectorNotes: [
      'Geri dönüşüm kutularının her birine (Plastik, Kağıt, Organik, Metal) ekleyin.',
      '"acceptedType" alanından hangi atığı kabul ettiğini seçin.',
      'Sahnede bulunan "RooftopSortingManager" referansını bağlayın.'
    ],
    code: `using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

/// <summary>
/// Çatı Çiftliği - TrashRecyclingBin
/// Bırakılan atığı doğrular ve RooftopSortingManager'a bildirir.
/// </summary>
public class TrashRecyclingBin : MonoBehaviour, IDropHandler, IPointerEnterHandler, IPointerExitHandler
{
    public WasteType acceptedType;
    public string binName = "Plastik Kutusu";
    public RooftopSortingManager sortingManager;

    [Header("--- Görsel Vurgu ---")]
    public Image highlightBorder;
    public ParticleSystem successParticle;

    private void Awake()
    {
        if (sortingManager == null) sortingManager = FindFirstObjectByType<RooftopSortingManager>();
        if (highlightBorder != null) highlightBorder.enabled = false;
    }

    public void OnPointerEnter(PointerEventData eventData)
    {
        if (eventData.pointerDrag != null && highlightBorder != null)
        {
            highlightBorder.enabled = true;
        }
    }

    public void OnPointerExit(PointerEventData eventData)
    {
        if (highlightBorder != null) highlightBorder.enabled = false;
    }

    public void OnDrop(PointerEventData eventData)
    {
        if (highlightBorder != null) highlightBorder.enabled = false;

        GameObject droppedObj = eventData.pointerDrag;
        if (droppedObj == null) return;

        DraggableTrashItem trashItem = droppedObj.GetComponent<DraggableTrashItem>();
        if (trashItem == null) return;

        // Kategori doğrulaması
        if (trashItem.wasteType == this.acceptedType)
        {
            // Doğru kutu!
            trashItem.ConfirmSorted();
            if (successParticle != null) successParticle.Play();
            if (sortingManager != null) sortingManager.OnTrashItemSortedCorrectly(trashItem);
        }
        else
        {
            // Yanlış kutu! Snap back tetiklenir
            if (sortingManager != null) sortingManager.OnWrongSortAttempt();
        }
    }
}`
  },
  {
    filename: 'RoofDecorationManager.cs',
    title: '5. RoofDecorationManager.cs (Katmanlı Çatı İnşaatı & Yeşillendirme)',
    description: 'Atıklar temizlendikten sonra oyuncunun sırayla çatıyı dekore etmesini sağlar (1. Toprak & Yeşillendir, 2. Güneş Panelleri Yerleştir, 3. Yağmur Deposu Kur). Tüm adımlar bitince -15°C soğutmayı tetikler ve kamerayı şehir haritasına geri çeker.',
    purpose: 'Kullanıcının istediği adım adım çatı kurma ve 3D izometrik bostana dönüştürme mekaniğini yürütür.',
    unityComponentsUsed: ['UnityEngine.UI.Button', 'GameObject Katmanları', 'AudioSource', 'IEnumerator Coroutine'],
    inspectorNotes: [
      'Çatı inşaat kontrol paneline bu scripti ekleyin.',
      '"soilAndGardenLayer": Çatıda çıkacak toprak ve sebze yatakları nesnesi.',
      '"solarPanelsLayer": Çatı kenarındaki fotovoltaik güneş panelleri nesnesi.',
      '"rainwaterTankLayer": Yağmur suyu deposu nesnesi.',
      'Butonları sırasıyla "btnStep1Soil", "btnStep2Solar", "btnStep3Water" alanlarına bağlayın.'
    ],
    code: `using System.Collections;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// Çatı Çiftliği - RoofDecorationManager
/// Kademeli (Yavaş) İnşa Animasyonu (Coroutine / DOTween uyumlu)
/// 1. Adım: Organik toprak ve çim katmanı yavaşça belirir (fade-in & spread)
/// 2. Adım: Ağaçlar ve sebze bostanı filizlenip yerleşir (crops sprout)
/// 3. Adım: Güneş panelleri kademeli olarak sırayla çatı kenarına dizilir (staggered)
/// 4. Adım: Yağmur hasat deposu yerleşir ve damla sulama aktifleşir
/// Toplam 1.5 - 2.0 saniyelik tatmin edici animasyon akışı sunar.
/// </summary>
public class RoofDecorationManager : MonoBehaviour
{
    [Header("--- Görsel Çatı Katmanları ---")]
    public GameObject soilAndGrassLayer;      // 1. Katman: Toprak & Yeşil Çim
    public GameObject cropsAndTreesLayer;     // 2. Katman: Bostan sebzeleri & ağaçlar
    public List<GameObject> solarPanelUnits;  // 3. Katman: Sırayla dizilen fotovoltaik paneller (4 adet)
    public GameObject rainwaterTankLayer;     // 4. Katman: Yağmur tankı & sulama

    [Header("--- İnşa Butonları ---")]
    public Button btnStep1Soil;
    public Button btnStep2Solar;
    public Button btnStep3Water;
    public Button btnAutoGradualBuild;        // Tek tıkla kademeli tam inşaat

    [Header("--- Sesler ---")]
    public AudioSource audioSource;
    public AudioClip soilSpreadSound;
    public AudioClip plantSproutSound;
    public AudioClip solarPanelLatchSound;
    public AudioClip grandCelebrationSound;

    [Header("--- Durum ---")]
    public bool isStep1Done = false;
    public bool isStep2Done = false;
    public bool isStep3Done = false;
    public bool isAnimating = false;

    private void Start()
    {
        // Başlangıçta tüm inşa katmanlarını gizle
        if (soilAndGrassLayer != null) soilAndGrassLayer.SetActive(false);
        if (cropsAndTreesLayer != null) cropsAndTreesLayer.SetActive(false);
        foreach (var panel in solarPanelUnits)
        {
            if (panel != null) panel.SetActive(false);
        }
        if (rainwaterTankLayer != null) rainwaterTankLayer.SetActive(false);

        // Buton dinleyicilerini bağla
        if (btnStep1Soil != null)
        {
            btnStep1Soil.interactable = true;
            btnStep1Soil.onClick.AddListener(() => StartCoroutine(BuildSoilAndGardenRoutine()));
        }

        if (btnStep2Solar != null)
        {
            btnStep2Solar.interactable = false;
            btnStep2Solar.onClick.AddListener(() => StartCoroutine(BuildSolarPanelsRoutine()));
        }

        if (btnStep3Water != null)
        {
            btnStep3Water.interactable = false;
            btnStep3Water.onClick.AddListener(() => StartCoroutine(BuildRainwaterRoutine()));
        }

        if (btnAutoGradualBuild != null)
        {
            btnAutoGradualBuild.onClick.AddListener(StartFullGradualSequence);
        }
    }

    /// <summary>
    /// Tek tıkla tüm çatıyı 1.8 saniyelik kademeli akışla inşa eder
    /// </summary>
    public void StartFullGradualSequence()
    {
        if (isAnimating) return;
        StartCoroutine(FullGradualConstructionRoutine());
    }

    private IEnumerator FullGradualConstructionRoutine()
    {
        isAnimating = true;

        // 1. Aşama: Toprak & Çim (0 - 0.6s)
        yield return StartCoroutine(BuildSoilAndGardenRoutine());
        yield return new WaitForSeconds(0.2f);

        // 2. Aşama: Güneş Panelleri Sırayla (0.6 - 1.3s)
        yield return StartCoroutine(BuildSolarPanelsRoutine());
        yield return new WaitForSeconds(0.2f);

        // 3. Aşama: Yağmur Deposu & Tamamlama (1.3 - 2.0s)
        yield return StartCoroutine(BuildRainwaterRoutine());

        isAnimating = false;
    }

    /// <summary>
    /// 1. Aşama Coroutine: Toprak yayılır, ardından bostan sebzeleri zıplayarak belirir
    /// </summary>
    public IEnumerator BuildSoilAndGardenRoutine()
    {
        if (isStep1Done) yield break;
        isStep1Done = true;

        if (audioSource != null && soilSpreadSound != null)
            audioSource.PlayOneShot(soilSpreadSound);

        // Toprak katmanını yavaşça aç (scale 0'dan 1'e)
        if (soilAndGrassLayer != null)
        {
            soilAndGrassLayer.SetActive(true);
            yield return StartCoroutine(AnimateScale(soilAndGrassLayer.transform, 0.45f));
        }

        yield return new WaitForSeconds(0.15f);

        // Sebzeleri ve ağaçları filizlendir
        if (audioSource != null && plantSproutSound != null)
            audioSource.PlayOneShot(plantSproutSound);

        if (cropsAndTreesLayer != null)
        {
            cropsAndTreesLayer.SetActive(true);
            yield return StartCoroutine(AnimateScale(cropsAndTreesLayer.transform, 0.45f));
        }

        if (btnStep1Soil != null) btnStep1Soil.interactable = false;
        if (btnStep2Solar != null) btnStep2Solar.interactable = true;
    }

    /// <summary>
    /// 2. Aşama Coroutine: Güneş panelleri çatı kenarına sırayla (staggered) dizilir
    /// </summary>
    public IEnumerator BuildSolarPanelsRoutine()
    {
        if (!isStep1Done || isStep2Done) yield break;
        isStep2Done = true;

        // Her paneli 0.2 saniye aralıkla teker teker yerleştir
        for (int i = 0; i < solarPanelUnits.Count; i++)
        {
            GameObject panel = solarPanelUnits[i];
            if (panel != null)
            {
                panel.SetActive(true);
                if (audioSource != null && solarPanelLatchSound != null)
                    audioSource.PlayOneShot(solarPanelLatchSound, 0.7f);

                StartCoroutine(AnimateScale(panel.transform, 0.25f));
            }
            yield return new WaitForSeconds(0.2f);
        }

        if (btnStep2Solar != null) btnStep2Solar.interactable = false;
        if (btnStep3Water != null) btnStep3Water.interactable = true;
    }

    /// <summary>
    /// 3. Aşama Coroutine: Su deposu ve sulama hattı kurulur, kutlama başlar
    /// </summary>
    public IEnumerator BuildRainwaterRoutine()
    {
        if (!isStep2Done || isStep3Done) yield break;
        isStep3Done = true;

        if (rainwaterTankLayer != null)
        {
            rainwaterTankLayer.SetActive(true);
            yield return StartCoroutine(AnimateScale(rainwaterTankLayer.transform, 0.35f));
        }

        if (btnStep3Water != null) btnStep3Water.interactable = false;

        yield return StartCoroutine(RoofCompletedSequence());
    }

    private IEnumerator AnimateScale(Transform target, float duration)
    {
        Vector3 initial = Vector3.zero;
        Vector3 targetScale = Vector3.one;
        target.localScale = initial;

        float elapsed = 0f;
        while (elapsed < duration)
        {
            elapsed += Time.deltaTime;
            float t = elapsed / duration;
            // Overshoot bounce easing
            float ease = 1f + 2.70158f * Mathf.Pow(t - 1f, 3f) + 1.70158f * Mathf.Pow(t - 1f, 2f);
            target.localScale = Vector3.LerpUnclamped(initial, targetScale, Mathf.Clamp01(ease));
            yield return null;
        }
        target.localScale = targetScale;
    }

    private IEnumerator RoofCompletedSequence()
    {
        if (audioSource != null && grandCelebrationSound != null)
        {
            audioSource.PlayOneShot(grandCelebrationSound);
        }

        // Şehir sıcaklığını 15°C düşür (-15°C)
        if (GameManager.Instance != null)
        {
            GameManager.Instance.OnRoofCompletedAndDecorated();
        }

        // Oyuncunun eseri incelemesi için 1.5 saniye bekle
        yield return new WaitForSeconds(1.5f);

        // Kamerayı şehir haritasına geri çek (Zoom-Out)
        if (LevelCameraZoom.Instance != null)
        {
            LevelCameraZoom.Instance.ZoomOutToCityOverview(1.0f);
        }

        if (GameManager.Instance != null)
        {
            GameManager.Instance.isRoofWorkspaceActive = false;
        }

        gameObject.SetActive(false); // Çalışma panelini kapat
    }
}`
  },
  {
    filename: 'LevelCameraZoom.cs',
    title: '6. LevelCameraZoom.cs (Akıcı Sinematik Kamera Zoom & Pan)',
    description: 'Tıklanan binaya akıcı bir şekilde yavaşça yakınlaşan (zoom-in) ve çatı temizliği/inşaatı bitince genel şehir haritasına geri dönen (zoom-out) kamera kontrolcüsü.',
    purpose: 'Kamerayı ekran sınırları dışına kaçırmadan, doğrudan tıklanan binanın çatısına odaklayarak sinematik geçiş sağlar.',
    unityComponentsUsed: ['Camera (OrthographicSize)', 'Mathf.SmoothStep', 'Vector3.Lerp'],
    inspectorNotes: [
      'Main Camera nesnesine bu scripti ekleyin.',
      'Genel şehir görünümü için "overviewSize" (Örn: 6.5f), yakın çekim için "closeUpSize" (Örn: 2.4f) girin.',
      '"defaultZoomDuration" alanına 1.0f verin.'
    ],
    code: `using System.Collections;
using UnityEngine;

/// <summary>
/// Çatı Çiftliği - LevelCameraZoom
/// Binaya yavaşça zoom-in ve şehir haritasına zoom-out geçişlerini yönetir.
/// </summary>
public class LevelCameraZoom : MonoBehaviour
{
    public static LevelCameraZoom Instance { get; private set; }

    [Header("--- Kamera Boyutları (Orthographic) ---")]
    public float overviewSize = 6.5f;
    public float closeUpSize = 2.4f;
    public float defaultZoomDuration = 1.0f;

    private Camera cam;
    private Vector3 initialOverviewPosition;
    private Coroutine activeZoomCoroutine;

    private void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }
        Instance = this;

        cam = GetComponent<Camera>();
        if (cam == null) cam = Camera.main;

        initialOverviewPosition = transform.position;
    }

    /// <summary>
    /// Tıklanan binaya doğru kamerayı yavaşça yaklaştırır (Zoom-in)
    /// </summary>
    public void ZoomInToBuilding(Vector3 buildingPosition, float duration = -1f)
    {
        if (duration <= 0) duration = defaultZoomDuration;

        if (activeZoomCoroutine != null) StopCoroutine(activeZoomCoroutine);
        Vector3 targetPos = new Vector3(buildingPosition.x, buildingPosition.y, initialOverviewPosition.z);
        activeZoomCoroutine = StartCoroutine(AnimateCamera(targetPos, closeUpSize, duration));
    }

    /// <summary>
    /// İnşaat bitince genel şehir haritasına geri döner (Zoom-out)
    /// </summary>
    public void ZoomOutToCityOverview(float duration = -1f)
    {
        if (duration <= 0) duration = defaultZoomDuration;

        if (activeZoomCoroutine != null) StopCoroutine(activeZoomCoroutine);
        activeZoomCoroutine = StartCoroutine(AnimateCamera(initialOverviewPosition, overviewSize, duration));
    }

    private IEnumerator AnimateCamera(Vector3 targetPos, float targetSize, float duration)
    {
        Vector3 startPos = transform.position;
        float startSize = cam.orthographicSize;
        float t = 0f;

        while (t < 1f)
        {
            t += Time.deltaTime / duration;
            float smooth = Mathf.SmoothStep(0f, 1f, t);

            transform.position = Vector3.Lerp(startPos, targetPos, smooth);
            cam.orthographicSize = Mathf.Lerp(startSize, targetSize, smooth);
            yield return null;
        }

        transform.position = targetPos;
        cam.orthographicSize = targetSize;
        activeZoomCoroutine = null;
    }
}`
  }
];

export const UNITY_SETUP_GUIDE_STEPS = [
  {
    step: 'Adım 1',
    title: 'Çatıya Yavaşça Yaklaşma (LevelCameraZoom)',
    description: 'Main Camera üzerine "LevelCameraZoom.cs" scriptini ekleyin. Oyuncu bir binaya tıkladığında kamera akıcı bir biçimde binanın çatısına doğru yakınlaşır (Zoom-In).',
    badge: 'Kamera Yakınlaşması'
  },
  {
    step: 'Adım 2',
    title: 'Çatıdaki Çoklu Atıklar (DraggableTrashItem & SortingManager)',
    description: 'Çatı üzerinde saçılmış çöplere "DraggableTrashItem.cs" ekleyin. "WasteType" enumunu (Plastic, Paper, Organic, Metal) belirleyin. Çatı yöneticisine "RooftopSortingManager.cs" scriptini ekleyin.',
    badge: 'Sürükle-Bırak Ayrıştırma'
  },
  {
    step: 'Adım 3',
    title: 'Geri Dönüşüm Kutuları (TrashRecyclingBin)',
    description: 'Çatının kenarında yer alan 4 geri dönüşüm kutusuna "TrashRecyclingBin.cs" scriptini ekleyin. Hangi kutunun hangi atığı kabul ettiğini (Örn: Sarı kutu = Plastic) seçin.',
    badge: 'Kategori Eşleştirme'
  },
  {
    step: 'Adım 4',
    title: 'Adım Adım Çatıyı İnşa Et (RoofDecorationManager)',
    description: 'Atıklar bitince açılan araç çubuğuna "RoofDecorationManager.cs" scriptini ekleyin. Oyuncu önce "1. Toprak & Yeşillendir", sonra "2. Güneş Panelleri", ardından "3. Yağmur Deposu" butonlarına basarak çatıyı 3D bostana dönüştürür.',
    badge: 'Çatı İnşaatı'
  },
  {
    step: 'Adım 5',
    title: 'Sıcaklık Düşüşü (-15°C) & Şehir Haritasına Dönüş',
    description: 'Son inşa adımı bitince GameManager otomatik olarak "cityTemperature -= 15f" çağırır, termometre soğur ve kamera yavaşça genel şehir haritasına (Zoom-Out) geri döner.',
    badge: '-15°C Soğuma'
  }
];
