package usecase

import (
	"context"

	"github.com/google/uuid"
	"github.com/undangan-digital/api/app/dto"
	"github.com/undangan-digital/api/domain/entities"
	domainerrors "github.com/undangan-digital/api/domain/errors"
	"github.com/undangan-digital/api/domain/repositories"
)

type RSVPUseCase struct {
	rsvpRepo repositories.RSVPRepository
	invRepo  repositories.InvitationRepository
}

func NewRSVPUseCase(rsvpRepo repositories.RSVPRepository, invRepo repositories.InvitationRepository) *RSVPUseCase {
	return &RSVPUseCase{rsvpRepo: rsvpRepo, invRepo: invRepo}
}

func (uc *RSVPUseCase) Submit(ctx context.Context, invitationID uuid.UUID, req dto.CreateRSVPRequest) (*entities.RSVP, error) {
	// Verify invitation exists and is published
	inv, err := uc.invRepo.GetByID(ctx, invitationID)
	if err != nil {
		return nil, err
	}
	if !inv.IsPublic() {
		return nil, domainerrors.ErrInvitationNotFound
	}

	guestCount := req.GuestCount
	if guestCount == 0 {
		guestCount = 1
	}

	rsvp := entities.NewRSVP(invitationID, req.GuestName, req.Status, guestCount, req.Message)
	if err := uc.rsvpRepo.Create(ctx, rsvp); err != nil {
		return nil, err
	}
	return rsvp, nil
}

func (uc *RSVPUseCase) List(ctx context.Context, userID, invitationID uuid.UUID, req dto.ListRSVPRequest) ([]*entities.RSVP, *entities.RSVPSummary, int64, error) {
	// Verify ownership
	inv, err := uc.invRepo.GetByID(ctx, invitationID)
	if err != nil {
		return nil, nil, 0, err
	}
	if inv.UserID != userID {
		return nil, nil, 0, domainerrors.ErrInvitationForbidden
	}

	filter := repositories.RSVPFilter{
		Page:  req.Page,
		Limit: req.Limit,
	}
	if req.Status != "" {
		status := entities.RSVPStatus(req.Status)
		filter.Status = &status
	}

	rsvps, total, err := uc.rsvpRepo.ListByInvitationID(ctx, invitationID, filter)
	if err != nil {
		return nil, nil, 0, err
	}

	summary, err := uc.rsvpRepo.GetSummary(ctx, invitationID)
	if err != nil {
		return nil, nil, 0, err
	}

	return rsvps, summary, total, nil
}
