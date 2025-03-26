;; Device Registration Contract
;; Records details of portable diagnostic equipment

;; Define data variables
(define-data-var last-device-id uint u0)

;; Define data maps
(define-map devices
  { device-id: uint }
  {
    name: (string-ascii 100),
    serial-number: (string-ascii 50),
    model: (string-ascii 100),
    manufacturer: (string-ascii 100),
    acquisition-date: uint,
    last-maintenance-date: uint,
    owner: principal
  }
)

;; Define public functions
(define-public (register-device
                (name (string-ascii 100))
                (serial-number (string-ascii 50))
                (model (string-ascii 100))
                (manufacturer (string-ascii 100))
                (acquisition-date uint))
  (let ((new-id (+ (var-get last-device-id) u1)))
    (begin
      (var-set last-device-id new-id)
      (map-set devices
        { device-id: new-id }
        {
          name: name,
          serial-number: serial-number,
          model: model,
          manufacturer: manufacturer,
          acquisition-date: acquisition-date,
          last-maintenance-date: u0,
          owner: tx-sender
        }
      )
      (ok new-id)
    )
  )
)

(define-public (update-device-owner
                (device-id uint)
                (new-owner principal))
  (let ((device (unwrap! (map-get? devices { device-id: device-id }) (err u1))))
    (if (is-eq tx-sender (get owner device))
      (begin
        (map-set devices
          { device-id: device-id }
          (merge device { owner: new-owner })
        )
        (ok true)
      )
      (err u2) ;; Not the owner
    )
  )
)

(define-public (update-maintenance-date
                (device-id uint)
                (maintenance-date uint))
  (let ((device (unwrap! (map-get? devices { device-id: device-id }) (err u1))))
    (if (is-eq tx-sender (get owner device))
      (begin
        (map-set devices
          { device-id: device-id }
          (merge device { last-maintenance-date: maintenance-date })
        )
        (ok true)
      )
      (err u2) ;; Not the owner
    )
  )
)

;; Read-only functions
(define-read-only (get-device (device-id uint))
  (map-get? devices { device-id: device-id })
)

(define-read-only (get-device-count)
  (var-get last-device-id)
)

